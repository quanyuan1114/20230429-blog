import { env } from "cloudflare:workers";

export const EDITOR_COOKIE = "firefly_editor";
export const SESSION_TTL_SECONDS = 24 * 60 * 60;
const PBKDF2_ITERATIONS = 310_000;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const MAX_LOGIN_FAILURES = 5;

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
};

type D1Binding = {
  prepare(query: string): D1Statement;
};

type CredentialRow = {
  password_hash: string;
};

function runtimeEnv() {
  return env as unknown as Record<string, string | D1Binding | undefined>;
}

function database() {
  const binding = runtimeEnv().DB;
  if (!binding || typeof binding === "string") {
    throw new Error("编辑器数据库尚未配置。");
  }
  return binding;
}

function secret(name: string) {
  const value = runtimeEnv()[name];
  if (!value || typeof value !== "string") throw new Error(`${name} 尚未配置。`);
  return value;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashEditorPassword(password: string) {
  if (password.length < 12 || password.length > 256) {
    throw new Error("密码至少需要 12 个字符，最多 256 个字符。");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(hash)}`;
}

export async function verifyEditorPasswordHash(password: string, encoded: string) {
  const [algorithm, iterationText, saltText, hashText] = encoded.split("$");
  const iterations = Number(iterationText);
  if (algorithm !== "pbkdf2_sha256" || !Number.isInteger(iterations) || !saltText || !hashText) return false;
  const expected = base64UrlToBytes(hashText);
  const actual = await derivePassword(password, base64UrlToBytes(saltText), iterations);
  return constantTimeEqual(actual, expected);
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret("EDITOR_SESSION_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

export async function createSessionToken() {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ version: 1, expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })),
  );
  const signature = bytesToBase64Url(await hmac(payload));
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(payload);
  if (!constantTimeEqual(expected, base64UrlToBytes(signature))) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { version?: number; expiresAt?: number };
    return data.version === 1 && typeof data.expiresAt === "number" && data.expiresAt > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function readSessionCookie(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${EDITOR_COOKIE}=`))?.slice(EDITOR_COOKIE.length + 1);
}

export async function hasEditorSession(request: Request) {
  return verifySessionToken(readSessionCookie(request));
}

export function sessionCookieHeader(token: string) {
  return `${EDITOR_COOKIE}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookieHeader() {
  return `${EDITOR_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function getStoredCredential() {
  return database()
    .prepare("SELECT password_hash FROM editor_credentials WHERE id = 1")
    .first<CredentialRow>();
}

export async function setupEditorPassword(setupToken: string, password: string) {
  const existing = await getStoredCredential();
  if (existing) throw new Error("编辑密码已经设置。请使用修改密码功能。");
  const supplied = new TextEncoder().encode(setupToken);
  const expected = new TextEncoder().encode(secret("EDITOR_SETUP_TOKEN"));
  if (!constantTimeEqual(supplied, expected)) throw new Error("一次性设置口令无效。");
  const passwordHash = await hashEditorPassword(password);
  await database()
    .prepare("INSERT INTO editor_credentials (id, password_hash) VALUES (1, ?)")
    .bind(passwordHash)
    .run();
}

export async function verifyEditorPassword(password: string) {
  const credential = await getStoredCredential();
  if (!credential) return false;
  return verifyEditorPasswordHash(password, credential.password_hash);
}

export async function updateEditorPassword(password: string) {
  const passwordHash = await hashEditorPassword(password);
  await database()
    .prepare("UPDATE editor_credentials SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1")
    .bind(passwordHash)
    .run();
}

async function loginKey(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const windowStartedAt = Math.floor(Date.now() / 1000 / LOGIN_WINDOW_SECONDS) * LOGIN_WINDOW_SECONDS;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${ip.trim()}:${windowStartedAt}:${secret("EDITOR_SESSION_SECRET")}`),
  );
  return { key: bytesToBase64Url(new Uint8Array(digest)), windowStartedAt };
}

export async function isLoginRateLimited(request: Request) {
  const { key } = await loginKey(request);
  const row = await database()
    .prepare("SELECT count FROM auth_attempts WHERE key = ?")
    .bind(key)
    .first<{ count: number }>();
  return (row?.count ?? 0) >= MAX_LOGIN_FAILURES;
}

export async function recordLoginFailure(request: Request) {
  const { key, windowStartedAt } = await loginKey(request);
  await database()
    .prepare(
      "INSERT INTO auth_attempts (key, count, window_started_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP",
    )
    .bind(key, windowStartedAt)
    .run();
}

export async function clearLoginFailures(request: Request) {
  const { key, windowStartedAt } = await loginKey(request);
  await database().prepare("DELETE FROM auth_attempts WHERE key = ?").bind(key).run();
  await database()
    .prepare("DELETE FROM auth_attempts WHERE window_started_at < ?")
    .bind(windowStartedAt - LOGIN_WINDOW_SECONDS)
    .run();
}
