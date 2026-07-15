"use client";

import { useEffect, useState } from "react";

const posts = [
  {
    category: "思考",
    date: "2026.07.12",
    title: "在 AI 时代，重新学习如何提出一个好问题",
    excerpt:
      "工具正在变得聪明，而判断依然属于我们。关于提问、验证，以及保留思考耐心的一些记录。",
    readingTime: "8 分钟",
    featured: true,
  },
  {
    category: "笔记",
    date: "2026.06.28",
    title: "我的数字花园，和那些未完成的笔记",
    excerpt: "比起完美归档，我更愿意让知识自然生长。",
    readingTime: "5 分钟",
  },
  {
    category: "生活",
    date: "2026.06.03",
    title: "夏夜散步：城市背面的十公里",
    excerpt: "没有目的地的一晚，风、树影和便利店的灯。",
    readingTime: "4 分钟",
  },
];

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("firefly-theme");
    const initial = saved === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("firefly-theme", next);
  }

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="fireflies" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>

      <header className="nav-wrap container">
        <a className="brand" href="#top" aria-label="Firefly 首页">
          <span className="brand-mark" aria-hidden="true">
            <i />
          </span>
          <span>FIREFLY</span>
        </a>

        <nav aria-label="主导航">
          <a href="#articles">文章</a>
          <a href="#about">关于</a>
          <a href="#contact">联系</a>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
            title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
          >
            <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="hero container">
          <div className="hero-copy-wrap">
            <p className="eyebrow">quanyuan1114 · personal journal</p>
            <h1>
              记录思考，
              <span>也记录生活</span>
            </h1>
            <p className="hero-copy">
              这里收集技术、阅读与日常里的微小发现。愿每一段文字，都像夜色中的萤火——短暂，却认真地发着光。
            </p>
            <a className="primary-link" href="#articles">
              开始阅读 <span aria-hidden="true">↘</span>
            </a>
          </div>

          <aside className="hero-note" aria-label="今日手记">
            <span className="quote-mark" aria-hidden="true">“</span>
            <blockquote>
              我们写下的，不只是答案，
              <br />
              也是走向答案时留下的微光。
            </blockquote>
            <p>今日手记 · 22:14</p>
          </aside>
        </section>

        <section className="articles container" id="articles">
          <div className="section-heading">
            <div>
              <span className="section-number">01</span>
              <h2>最近更新</h2>
            </div>
            <span className="section-line" aria-hidden="true" />
            <a href="#archive">查看全部文章</a>
          </div>

          <div className="post-grid">
            {posts.map((post) => (
              <article
                className={`post-card${post.featured ? " featured" : ""}`}
                key={post.title}
              >
                <div>
                  <div className="post-meta">
                    <span>{post.category}</span>
                    <time dateTime={post.date.replaceAll(".", "-")}>{post.date}</time>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <div className="post-footer">
                  <span>{post.readingTime}阅读</span>
                  <span className="post-arrow" aria-hidden="true">↗</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about container" id="about">
          <div className="section-heading about-heading">
            <div>
              <span className="section-number">02</span>
              <h2>关于我</h2>
            </div>
            <span className="section-line" aria-hidden="true" />
          </div>

          <div className="about-grid">
            <div className="about-intro">
              <div className="avatar" aria-hidden="true">Q</div>
              <div>
                <h3>你好，我是 quanyuan1114。</h3>
                <p>
                  一个持续学习的普通人。关注人工智能与技术，也喜欢阅读、写作和长距离散步。我在这里把零散的想法慢慢写成自己的坐标。
                </p>
              </div>
            </div>

            <div className="now-card">
              <span>NOW</span>
              <p>正在研究 AI，整理阅读笔记，并搭建这个属于自己的小小数字花园。</p>
            </div>
          </div>
        </section>

        <section className="contact container" id="contact">
          <span className="section-number">03</span>
          <p>如果这些文字恰好与你产生共鸣，欢迎来打个招呼。</p>
          <a
            href="https://github.com/quanyuan1114"
            target="_blank"
            rel="noreferrer"
          >
            在 GitHub 找到我 <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <footer className="footer container" id="archive">
        <p>© 2026 quanyuan1114</p>
        <p className="footer-status"><i aria-hidden="true" /> 在夜色中持续发光</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </div>
  );
}
