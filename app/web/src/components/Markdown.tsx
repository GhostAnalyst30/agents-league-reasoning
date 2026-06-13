import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BookMarked } from 'lucide-react'

/** Fold the unicode punctuation gpt-oss emits and turn [ref_id:N] citations into links. */
function preprocess(text: string): string {
  return text
    .replace(/[\u2010\u2011\u2012]/g, '-')
    .replace(/[\u202f\u00a0]/g, ' ')
    .replace(/[【\[]\s*ref[\s_]?id\s*[:=]?\s*(\d+)\s*[】\]]/gi, '[ref $1](#citation-$1)')
}

export default function Markdown({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-[13.5px] leading-relaxed text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) =>
            href?.startsWith('#citation-') ? (
              <span className="chip mx-0.5 translate-y-[-1px] cursor-default border border-indigo-400/30 bg-indigo-500/15 text-indigo-300">
                <BookMarked size={10} strokeWidth={2.5} />
                {children}
              </span>
            ) : (
              <a href={href} className="text-cyan-400 underline decoration-cyan-400/40 hover:decoration-cyan-400" target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
          h1: ({ children }) => <h3 className="pt-1 text-base font-bold text-white">{children}</h3>,
          h2: ({ children }) => <h4 className="pt-1 text-[15px] font-bold text-white">{children}</h4>,
          h3: ({ children }) => <h5 className="pt-1 text-sm font-semibold text-white">{children}</h5>,
          strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5 marker:text-indigo-400">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5 marker:text-indigo-400">{children}</ol>,
          hr: () => <hr className="border-white/10" />,
          code: ({ children }) => (
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-cyan-300">{children}</code>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full border-collapse text-left text-[12.5px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/[0.06] text-slate-100">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-t border-white/[0.06] px-3 py-2 align-top">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-400/50 pl-3 italic text-slate-400">{children}</blockquote>
          ),
        }}
      >
        {preprocess(text)}
      </ReactMarkdown>
    </div>
  )
}
