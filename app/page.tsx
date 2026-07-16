"use client";

import { useEffect, useState } from "react";

const directions = [
  {
    code: "A",
    priority: "主线课题",
    score: "9.5 / 10",
    title: "跨工况电池健康时序基础模型",
    question:
      "能否通过自监督预训练，让 SOH、RUL 与异常诊断模型跨电芯、温度、工况乃至化学体系迁移？",
    methods: ["时序基础模型", "自监督学习", "域泛化", "多模态融合"],
    fit: "连接电池组与算法组，也能复用计算机视觉中的表征学习和生物信息中的小样本、异质数据经验。",
    output: "数据基准 → 通用表征模型 → 跨域适配方法",
  },
  {
    code: "B",
    priority: "核心方法",
    score: "9.2 / 10",
    title: "物理信息概率退化数字孪生",
    question:
      "如何把等效电路、退化机理与神经微分方程结合，并为每一次寿命预测给出可信区间？",
    methods: ["物理约束学习", "神经 ODE", "不确定性量化", "可解释诊断"],
    fit: "强化控制学科辨识度，避免只在单一公开数据集上追求精度，更适合形成长期学术标签。",
    output: "可微退化模型 → 概率预测 → 在线更新数字孪生",
  },
  {
    code: "C",
    priority: "系统落地",
    score: "8.8 / 10",
    title: "安全离线强化学习与充放电优化",
    question:
      "能否仅利用历史运行数据，在不突破温度、寿命与功率约束的前提下优化充电和储能调度？",
    methods: ["安全离线强化学习", "模型预测控制", "约束优化", "策略验证"],
    fit: "把算法优化组与电池健康主线闭环连接，产出从“预测健康”走向“延长寿命”的系统贡献。",
    output: "退化感知控制 → 安全策略学习 → 半实物验证",
  },
  {
    code: "D",
    priority: "拓展方向",
    score: "8.3 / 10",
    title: "能源互联网图学习与多智能体协同",
    question:
      "如何在拓扑变化、异步通信和隐私限制下，实现储能节点的分布式预测与协同控制？",
    methods: ["图神经网络", "多智能体学习", "联邦学习", "分布式优化"],
    fit: "对接导师的能源互联网组，适合作为后半程扩展，而不建议在博士早期同时铺开。",
    output: "节点表征 → 拓扑泛化 → 分布式协同决策",
  },
];

const roadmap = [
  {
    phase: "第 1 年",
    title: "建立可复现基线",
    detail:
      "系统学习电化学与 BMS；统一 NASA、CALCE、Oxford、BatteryML 等数据；完成跨数据集评测协议和强基线。",
    milestone: "1 个公开基准 / 1 篇综述或基准论文",
  },
  {
    phase: "第 2 年",
    title: "攻克跨域泛化",
    detail:
      "开展电池时序自监督预训练，研究跨电芯、跨温度、跨工况与跨化学体系迁移，形成博士主方法。",
    milestone: "1–2 篇方法论文 / 开源预训练模型",
  },
  {
    phase: "第 3 年",
    title: "加入物理与决策",
    detail:
      "将退化机理、不确定性和在线更新纳入数字孪生，再连接安全离线强化学习或模型预测控制。",
    milestone: "1 篇交叉方法论文 / 1 个闭环原型",
  },
  {
    phase: "第 4 年",
    title: "系统化与学术品牌",
    detail:
      "向储能与能源互联网场景扩展，完成论文主线收束、博士论文、开源工具链与博后/高校申请材料。",
    milestone: "完整论文链 / 可演示系统 / Research Statement",
  },
];

const evidence = [
  {
    label: "ICLR 2024",
    title: "BatteryML：统一电池退化数据、特征与模型评测",
    href: "https://iclr.cc/virtual/2024/poster/17628",
  },
  {
    label: "Nature MI 2025",
    title: "BatLiNet：跨老化条件与跨化学体系的电池寿命迁移",
    href: "https://www.nature.com/articles/s42256-024-00972-x",
  },
  {
    label: "ICML 2024",
    title: "MOMENT：通用时序基础模型与少样本适配",
    href: "https://proceedings.mlr.press/v235/goswami24a.html",
  },
  {
    label: "ICLR 2025",
    title: "物理信息离线强化学习在真实能源系统中的闭环验证",
    href: "https://proceedings.iclr.cc/paper_files/paper/2025/file/76d2f8e328e1081c22a77ca0fa330ca5-Paper-Conference.pdf",
  },
  {
    label: "ICML 2025",
    title: "C2IQL：面向安全约束的离线强化学习",
    href: "https://icml.cc/virtual/2025/poster/46250",
  },
  {
    label: "ICLR 2025",
    title: "异步、分布式多智能体系统中的稳健图学习",
    href: "https://openreview.net/forum?id=WfxPVtYRlL",
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
          <a href="#positioning">定位</a>
          <a href="#directions">方向</a>
          <a href="#roadmap">路线图</a>
          <a href="#evidence">依据</a>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
            title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
          >
            <span aria-hidden="true">{theme === "dark" ? "☼" : "◐"}</span>
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="hero container">
          <div className="hero-copy-wrap">
            <p className="eyebrow">Doctoral research plan · 2026—2030</p>
            <h1>
              从健康预测，
              <span>走向可信决策。</span>
            </h1>
            <p className="hero-copy">
              我的博士研究将以电池健康管理为应用锚点，以时序基础模型与物理约束学习为方法主线，
              逐步延伸到安全优化和能源互联网，形成一条兼顾学术深度、团队协同与长期职业发展的研究路径。
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#directions">
                查看候选方向 <span aria-hidden="true">↘</span>
              </a>
              <a
                className="secondary-link"
                href="https://github.com/quanyuan1114"
                target="_blank"
                rel="noreferrer"
              >
                GitHub ↗
              </a>
            </div>
          </div>

          <aside className="hero-thesis" aria-label="博士课题建议">
            <span className="hero-thesis-label">建议总课题</span>
            <h2>面向复杂工况的可信电池智能</h2>
            <p>
              跨域时序表征、物理信息退化建模与安全优化控制
            </p>
            <div className="thesis-signal">
              <i aria-hidden="true" />
              <span>ONE CORE · THREE EXTENSIONS</span>
            </div>
          </aside>
        </section>

        <section className="profile-strip container" aria-label="研究背景">
          <div>
            <span>学科</span>
            <strong>控制科学与工程</strong>
            <p>人工智能应用与智能决策</p>
          </div>
          <div>
            <span>团队资源</span>
            <strong>电池 · 优化 · 能源互联网</strong>
            <p>具备跨组协同与真实场景入口</p>
          </div>
          <div>
            <span>已有积累</span>
            <strong>视觉 · 图像 · 生物信息</strong>
            <p>表征学习、小样本与异质数据</p>
          </div>
          <div>
            <span>职业目标</span>
            <strong>博后 / 高校</strong>
            <p>需要稳定方法标签与连续论文线</p>
          </div>
        </section>

        <section className="positioning container section-block" id="positioning">
          <div className="section-heading">
            <div>
              <span className="section-number">01</span>
              <h2>研究定位</h2>
            </div>
            <span className="section-line" aria-hidden="true" />
            <p>一条主线，逐层扩展</p>
          </div>

          <div className="positioning-grid">
            <div className="positioning-statement">
              <p className="statement-kicker">MY RESEARCH IDENTITY</p>
              <h3>
                可信时序智能
                <span>for Battery & Energy Systems</span>
              </h3>
              <p>
                不把博士课题做成“某个网络在某个数据集上提升一点精度”，而是回答三个长期问题：
                如何跨域泛化、如何表达不确定性、如何进入安全闭环。
              </p>
            </div>
            <div className="research-layers">
              <div>
                <span>01 · 表征</span>
                <strong>跨数据、跨工况的通用时序模型</strong>
              </div>
              <div>
                <span>02 · 机理</span>
                <strong>物理一致、可解释的概率退化模型</strong>
              </div>
              <div>
                <span>03 · 决策</span>
                <strong>健康感知、安全约束的优化控制</strong>
              </div>
              <div>
                <span>04 · 系统</span>
                <strong>面向能源互联网的分布式协同</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="directions container section-block" id="directions">
          <div className="section-heading">
            <div>
              <span className="section-number">02</span>
              <h2>候选研究方向</h2>
            </div>
            <span className="section-line" aria-hidden="true" />
            <p>按背景匹配与学术延展性排序</p>
          </div>

          <div className="direction-list">
            {directions.map((direction) => (
              <article className="direction-card" key={direction.code}>
                <div className="direction-index">
                  <span>{direction.code}</span>
                  <small>{direction.priority}</small>
                </div>
                <div className="direction-content">
                  <div className="direction-title-row">
                    <h3>{direction.title}</h3>
                    <span className="fit-score">{direction.score}</span>
                  </div>
                  <p className="research-question">{direction.question}</p>
                  <div className="method-tags">
                    {direction.methods.map((method) => (
                      <span key={method}>{method}</span>
                    ))}
                  </div>
                  <div className="direction-notes">
                    <p>
                      <strong>背景匹配</strong>
                      {direction.fit}
                    </p>
                    <p>
                      <strong>成果路径</strong>
                      {direction.output}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="topic container section-block">
          <div className="topic-card">
            <span className="topic-label">RECOMMENDED DISSERTATION TOPIC</span>
            <h2>
              面向复杂工况与跨体系泛化的
              <br />
              物理信息时序基础模型研究
            </h2>
            <p>
              ——及其在电池健康管理与能源系统安全优化中的应用
            </p>
            <div className="topic-questions">
              <div>
                <span>Q1</span>
                <p>如何从多源、异构、少标签电池数据中学习可迁移的退化表征？</p>
              </div>
              <div>
                <span>Q2</span>
                <p>如何让模型满足物理规律，并量化跨域预测的不确定性？</p>
              </div>
              <div>
                <span>Q3</span>
                <p>如何把健康预测嵌入安全充电、储能调度与协同控制闭环？</p>
              </div>
            </div>
          </div>
        </section>

        <section className="roadmap container section-block" id="roadmap">
          <div className="section-heading">
            <div>
              <span className="section-number">03</span>
              <h2>四年研究路线图</h2>
            </div>
            <span className="section-line" aria-hidden="true" />
            <p>每一年形成可验证的成果</p>
          </div>

          <div className="roadmap-list">
            {roadmap.map((item, index) => (
              <article className="roadmap-item" key={item.phase}>
                <div className="roadmap-marker">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i aria-hidden="true" />
                </div>
                <div>
                  <p className="roadmap-phase">{item.phase}</p>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <span className="milestone">{item.milestone}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="strategy container section-block">
          <div className="strategy-grid">
            <div>
              <span className="strategy-label">成果组合</span>
              <h2>为博后与高校岗位准备的学术资产</h2>
              <ul>
                <li>1 个可复用的跨数据集评测基准</li>
                <li>2–3 个围绕同一方法主线的核心模型</li>
                <li>1 个安全闭环或半实物系统原型</li>
                <li>持续维护的开源代码、数据文档与学术主页</li>
              </ul>
            </div>
            <div>
              <span className="strategy-label warning">明确避坑</span>
              <h2>不建议单独作为博士主线</h2>
              <ul>
                <li>只做群智能或元启发式算法的参数替换</li>
                <li>只在单一公开电池数据集上比较预测精度</li>
                <li>没有真实约束和数据闭环的“LLM + 能源”拼接</li>
                <li>同时铺开四个方向，导致每条线都缺少深度</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="evidence container section-block" id="evidence">
          <div className="section-heading">
            <div>
              <span className="section-number">04</span>
              <h2>方向依据</h2>
            </div>
            <span className="section-line" aria-hidden="true" />
            <p>来自近期正式论文与会议页面</p>
          </div>

          <div className="evidence-grid">
            {evidence.map((item) => (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="evidence-card"
                key={item.title}
              >
                <span>{item.label}</span>
                <p>{item.title}</p>
                <i aria-hidden="true">↗</i>
              </a>
            ))}
          </div>
        </section>

        <section className="contact container">
          <span className="section-number">05</span>
          <p>
            这份规划将随着数据、实验条件和论文反馈持续迭代，但研究身份保持稳定：
            <strong>可信时序智能 × 电池与能源系统。</strong>
          </p>
          <a
            href="https://github.com/quanyuan1114/20230429-blog"
            target="_blank"
            rel="noreferrer"
          >
            查看本站源码 <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <footer className="footer container">
        <p>© 2026 quanyuan1114</p>
        <p className="footer-status">
          <i aria-hidden="true" /> Research plan · living document
        </p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </div>
  );
}
