import { PageAmbient } from "./components/page-ambient";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

const modules = [
  { index: "01", href: "/research", label: "RESEARCH", title: "博士研究规划", copy: "围绕可信时序智能、电池健康与能源系统，持续收束博士阶段的学术主线。", meta: "4 个方向 · 4 年路线图" },
  { index: "02", href: "/notes", label: "NOTES", title: "学习笔记", copy: "用 Markdown 沉淀概念、公式、代码与论文方法，支持网页端编辑和云端保存。", meta: "Markdown · 实时预览" },
  { index: "03", href: "/reflections", label: "REFLECTIONS", title: "学习心得", copy: "记录阶段性理解、失败经验和认知变化，让研究过程本身成为可复用的方法。", meta: "复盘 · 方法 · 成长" },
  { index: "04", href: "/reading", label: "READING", title: "文献阅读", copy: "按研究问题组织论文，而不是堆积链接；追踪证据、方法差异和可复现实验。", meta: "论文地图 · 阅读队列" },
];

export default function Home() {
  return (
    <div className="site-shell home-shell">
      <PageAmbient />
      <SiteHeader active="home" />
      <main>
        <section className="workspace-hero container">
          <div>
            <p className="eyebrow">Academic workspace · research in progress</p>
            <h1>研究与学习，<span>在同一处生长。</span></h1>
            <p>这里是我的个人学术工作台：规划长期研究，记录日常学习，整理文献证据，也保留那些真正改变理解的瞬间。</p>
            <div className="hero-actions">
              <a className="primary-link" href="/notes">浏览学习笔记 <span>↘</span></a>
              <a className="secondary-link" href="/research">查看研究规划</a>
            </div>
          </div>
          <aside className="workspace-status">
            <span className="hero-thesis-label">CURRENT FOCUS</span>
            <strong>可信时序智能</strong>
            <p>AI × 电池健康 × 能源系统</p>
            <div className="status-lines"><i /><i /><i /><i /><i /></div>
            <small>Control Science & Engineering</small>
          </aside>
        </section>

        <section className="workspace-intro container">
          <span className="section-number">00</span>
          <p>从硕士阶段的计算机视觉与生物信息出发，连接电池健康管理、算法优化和能源互联网，逐步建立自己的研究身份。</p>
          <div><span>身份</span><strong>人工智能方向博士研究生</strong></div>
        </section>

        <section className="module-section container">
          <div className="section-heading"><div><span className="section-number">01</span><h2>内容模块</h2></div><span className="section-line" /><p>持续更新的知识系统</p></div>
          <div className="module-grid">
            {modules.map((module) => (
              <a className="module-card" href={module.href} key={module.href}>
                <div><span>{module.index}</span><small>{module.label}</small></div>
                <h3>{module.title}</h3>
                <p>{module.copy}</p>
                <footer><span>{module.meta}</span><b>↗</b></footer>
              </a>
            ))}
          </div>
        </section>

        <section className="now-section container">
          <div><span className="section-number">02</span><p className="statement-kicker">NOW EXPLORING</p></div>
          <div className="now-grid">
            <article><span>A</span><h3>跨工况电池时序表征</h3><p>如何让健康预测模型跨电芯、温度与化学体系迁移？</p></article>
            <article><span>B</span><h3>物理信息退化建模</h3><p>如何把退化机理与不确定性纳入可更新的数字孪生？</p></article>
            <article><span>C</span><h3>安全优化与闭环决策</h3><p>如何让健康预测真正进入充电、储能与调度策略？</p></article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
