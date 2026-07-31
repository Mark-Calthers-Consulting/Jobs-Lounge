import ReactMarkdown from 'react-markdown'

type MarkdownArticleProps = {
  content: string
  className?: string
}

const MarkdownArticle = ({ content, className = '' }: MarkdownArticleProps) => (
  <div className={`prose prose-slate max-w-none prose-a:text-[#184aa2] ${className}`}>
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
)

export default MarkdownArticle
