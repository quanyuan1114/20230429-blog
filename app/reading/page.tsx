import { PageAmbient } from "@/app/components/page-ambient";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

const tracks = [
  { stage: "主线", title: "Battery foundation models", topics: ["跨工况泛化", "自监督预训练", "跨化学体系迁移"], progress: "持续追踪" },
  { stage: "方法", title: "Physics-informed learning", topics: ["神经 ODE", "不确定性量化", "退化数字孪生"], progress: "建立框架" },
  { stage: "决策", title: "Safe offline reinforcement learning", topics: ["约束策略", "MPC", "真实系统验证"], progress: "专题阅读" },
  { stage: "拓展", title: "Graph & multi-agent energy systems", topics: ["拓扑泛化", "异步协同", "分布式优化"], progress: "后续展开" },
];

export default function ReadingPage() {
  return (
    <div className="site-shell inner-shell"><PageAmbient /><SiteHeader active="reading" />
      <main className="container inner-main">
        <header className="inner-hero"><p className="eyebrow">Reading map · evidence before opinion</p><div><h1>文献阅读</h1><p>围绕研究问题建立论文地图，追踪方法演进、关键证据与可复现线索。</p></div></header>
        <section className="reading-principle"><span>READING PRINCIPLE</span><blockquote>不按“读了多少篇”衡量进度，而按“解决了哪个问题、改变了哪个判断”组织阅读。</blockquote></section>
        <section className="reading-tracks">{tracks.map((track, index) => <article key={track.title}><div><span>{String(index + 1).padStart(2, "0")}</span><small>{track.stage}</small></div><div><h2>{track.title}</h2><div className="method-tags">{track.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></div><strong>{track.progress}</strong></article>)}</section>
        <div className="reading-callout"><p>近期代表性论文和阅读笔记将逐步链接到「学习笔记」模块。</p><a href="/notes">前往学习笔记 ↗</a></div>
      </main><SiteFooter />
    </div>
  );
}
