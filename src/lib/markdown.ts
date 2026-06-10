import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

export const markdownConfig = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeHighlight]
}
