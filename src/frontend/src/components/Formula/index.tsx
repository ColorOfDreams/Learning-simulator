import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface FormulaProps {
  children?: string;
  html?: string;
  tex?: string;
  inline?: boolean;
  block?: boolean;
  style?: React.CSSProperties;
}

const Formula: React.FC<FormulaProps> = ({ children, html, tex, inline, block, style }) => {
  const content = children || html || tex || '';

  if (tex) {
    const delimiters = block ? '$$' : '$';
    const mdContent = `${delimiters}${tex}${delimiters}`;
    return (
      <span className="formula-inline" style={style}>
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} skipHtml>
          {mdContent}
        </ReactMarkdown>
      </span>
    );
  }

  if (inline) {
    const mdContent = `$${content}$`;
    return (
      <span className="formula-inline" style={style}>
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} skipHtml>
          {mdContent}
        </ReactMarkdown>
      </span>
    );
  }

  return (
    <span className="formula-text" style={style}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </span>
  );
};

export default Formula;
