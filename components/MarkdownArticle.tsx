import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownArticleProps = {
  content: string
  className?: string
}

const markdownComponents: Components = {
  a: ({ node, href = '', children, ...props }) => {
    void node
    const external = /^https?:\/\//i.test(href)
    return (
      <a
        {...props}
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    )
  },
  table: ({ node, children, ...props }) => {
    void node
    return (
      <div className="my-8 overflow-x-auto rounded-lg border border-slate-200">
        <table {...props}>{children}</table>
      </div>
    )
  },
}

const MarkdownArticle = ({ content, className = '' }: MarkdownArticleProps) => (
  <div className={`prose prose-lg prose-slate max-w-none text-slate-700
    prose-headings:scroll-mt-28 prose-headings:font-bold prose-headings:tracking-[-0.02em] prose-headings:text-[#101A35]
    prose-h2:mt-12 prose-h2:text-3xl prose-h3:mt-9 prose-h3:text-2xl
    prose-p:leading-8 prose-li:my-1.5 prose-li:leading-7
    prose-a:font-medium prose-a:text-[#184aa2] prose-a:decoration-[#8daed6] prose-a:underline-offset-4 hover:prose-a:decoration-[#184aa2]
    prose-blockquote:border-l-[#184aa2] prose-blockquote:bg-[#f4f7fb] prose-blockquote:px-6 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-slate-700
    prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:text-[#101A35] prose-code:before:content-none prose-code:after:content-none
    prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-slate-800 prose-pre:bg-[#101A35]
    prose-hr:my-12 prose-hr:border-slate-200 prose-th:bg-slate-50 prose-th:px-4 prose-th:py-3 prose-td:px-4 prose-td:py-3
    ${className}`}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  </div>
)

export default MarkdownArticle
