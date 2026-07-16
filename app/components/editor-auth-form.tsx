"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "setup" | "password";

const copy = {
  login: {
    eyebrow: "EDITOR LOGIN",
    title: "进入内容编辑器",
    detail: "使用站点独立密码管理学习笔记与学习心得。",
    action: "登录",
  },
  setup: {
    eyebrow: "ONE-TIME SETUP",
    title: "设置编辑密码",
    detail: "该页面只在首次设置时有效。密码至少 12 个字符。",
    action: "完成设置",
  },
  password: {
    eyebrow: "SECURITY",
    title: "修改编辑密码",
    detail: "修改成功后，请使用新密码完成下一次登录。",
    action: "更新密码",
  },
};

function safeReturnTo(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/notes/editor";
}

export function EditorAuthForm({
  mode,
  initialSetupToken = "",
  returnTo = "/notes/editor",
}: {
  mode: AuthMode;
  initialSetupToken?: string;
  returnTo?: string;
}) {
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupToken, setSetupToken] = useState(initialSetupToken);
  const destination = safeReturnTo(returnTo);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mode !== "login" && password !== confirmPassword) {
      setMessage("两次输入的新密码不一致。");
      return;
    }
    setSubmitting(true);
    setMessage("正在验证…");
    const path = mode === "login" ? "/api/editor/login" : mode === "setup" ? "/api/editor/setup" : "/api/editor/password";
    const method = mode === "password" ? "PUT" : "POST";
    const body = mode === "login"
      ? { password }
      : mode === "setup"
        ? { password, setupToken }
        : { currentPassword, newPassword: password };

    try {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { error?: string; setupRequired?: boolean };
      if (data.setupRequired) {
        window.location.href = "/editor/setup";
        return;
      }
      if (!response.ok) throw new Error(data.error || "操作失败。");
      if (mode === "password") {
        setMessage("密码已更新。");
        setPassword(""); setConfirmPassword(""); setCurrentPassword("");
      } else {
        window.location.href = destination;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <Link className="auth-brand" href="/">FIREFLY</Link>
      <form className="auth-card" onSubmit={submit}>
        <span>{copy[mode].eyebrow}</span>
        <h1>{copy[mode].title}</h1>
        <p>{copy[mode].detail}</p>
        {mode === "setup" && !setupToken && (
          <label>一次性设置口令<input type="password" autoComplete="off" value={setupToken} onChange={(event) => setSetupToken(event.target.value)} required /></label>
        )}
        {mode === "password" && (
          <label>当前密码<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
        )}
        <label>{mode === "login" ? "编辑密码" : "新密码"}<input type="password" minLength={mode === "login" ? undefined : 12} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {mode !== "login" && (
          <label>再次输入新密码<input type="password" minLength={12} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
        )}
        {message && <div className="auth-message" role="status">{message}</div>}
        <button type="submit" disabled={submitting}>{submitting ? "处理中…" : copy[mode].action}</button>
        <a href={mode === "password" ? "/notes/editor" : "/notes"}>← 返回{mode === "password" ? "编辑器" : "公开笔记"}</a>
      </form>
    </main>
  );
}
