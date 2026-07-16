import { PageAmbient } from "@/app/components/page-ambient";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { NotesBrowser } from "@/app/components/notes-browser";

const prompts = [
  { id: "01", title: "我真正理解了什么？", copy: "不用论文里的原句，尝试用自己的语言讲清楚问题、假设和结论。" },
  { id: "02", title: "哪些判断被证伪了？", copy: "保留失败实验、错误直觉和被忽略的变量，它们往往比最优结果更有价值。" },
  { id: "03", title: "下一步最小验证是什么？", copy: "把模糊的研究焦虑改写成一个数据、一个对照实验或一个可以回答的问题。" },
];

export default function ReflectionsPage() {
  return (
    <div className="site-shell inner-shell"><PageAmbient /><SiteHeader active="reflections" />
      <main className="container inner-main">
        <header className="inner-hero"><p className="eyebrow">Reflections · learning how to learn</p><div><h1>学习心得</h1><p>不只记录学到了什么，也记录理解如何发生、判断如何改变。</p></div><a href="/notes/editor?type=reflection">写心得 <span>↗</span></a></header>
        <NotesBrowser type="reflection" />
        <section className="reflection-lead"><span>WHY REFLECT</span><h2>知识会过期，<br />思考方法可以复利。</h2><p>下面的问题用于阶段复盘、实验总结和研究方法反思，也可以直接作为新心得的写作提纲。</p></section>
        <section className="prompt-grid">{prompts.map((prompt) => <article key={prompt.id}><span>{prompt.id}</span><h3>{prompt.title}</h3><p>{prompt.copy}</p></article>)}</section>
        <section className="reflection-template"><div><span className="section-number">TEMPLATE</span><h2>每周研究复盘</h2></div><ol><li>本周最重要的新认识</li><li>最有信息量的失败</li><li>仍然无法解释的现象</li><li>下周唯一优先问题</li></ol></section>
      </main><SiteFooter />
    </div>
  );
}
