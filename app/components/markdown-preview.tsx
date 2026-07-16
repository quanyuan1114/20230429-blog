import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <article className="markdown-body">
      {content.trim() ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          skipHtml
          components={{
            a: ({ href, children }) => {
              const external = href?.startsWith("http");
              return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{children}</a>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      ) : (
        <p className="markdown-empty">预览会显示在这里。</p>
      )}
    </article>
  );
}
