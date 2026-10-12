import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const raw = match[0];
      if (raw.startsWith('`') && raw.endsWith('`')) {
        parts.push(
          <code
            key={`${match.index}-c`}
            className="px-1.5 py-0.5 mx-0.5 text-xs font-mono bg-[#151922] border border-[#292F3B] text-[#DCE5F2] rounded font-medium"
          >
            {raw.slice(1, -1)}
          </code>
        );
      } else if (raw.startsWith('**') && raw.endsWith('**')) {
        parts.push(
          <strong key={`${match.index}-b`} className="font-semibold text-[#F5F7FA]">
            {raw.slice(2, -2)}
          </strong>
        );
      } else if (raw.startsWith('*') && raw.endsWith('*')) {
        parts.push(
          <em key={`${match.index}-i`} className="italic text-[#DCE5F2]">
            {raw.slice(1, -1)}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split into segments by code blocks first
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-[#F5F7FA] leading-relaxed text-sm">
      {segments.map((segment, sIdx) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const lines = segment.slice(3, -3).split('\n');
          const language = lines[0].trim() || 'código';
          const code = lines.slice(1).join('\n').trim();

          return (
            <div
              key={`code-${sIdx}`}
              className="my-3 rounded-xl overflow-hidden border border-[#292F3B] bg-[#08090C] text-xs font-mono shadow-sm"
            >
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#151922] border-b border-[#292F3B] text-[#A7AFBD]">
                <span className="uppercase text-[11px] font-semibold tracking-wider text-[#DCE5F2]">
                  {language}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(code, sIdx)}
                  className="flex items-center gap-1.5 text-[11px] text-[#A7AFBD] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  {copiedIndex === sIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span className="text-[#F5F7FA] font-medium">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[#F5F7FA] leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Process non-code text into structured blocks
        const rawLines = segment.split('\n');
        const blocks: React.ReactNode[] = [];
        let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
        let currentParagraph: string[] = [];

        const flushParagraph = (key: string) => {
          if (currentParagraph.length > 0) {
            const pText = currentParagraph.join(' ');
            blocks.push(
              <p key={key} className="text-[#F5F7FA] leading-relaxed my-2">
                {renderInline(pText)}
              </p>
            );
            currentParagraph = [];
          }
        };

        const flushList = (key: string) => {
          if (currentList) {
            if (currentList.type === 'ul') {
              blocks.push(
                <ul key={key} className="list-disc pl-5 my-2 space-y-1 text-[#F5F7FA]">
                  {currentList.items.map((it, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {renderInline(it)}
                    </li>
                  ))}
                </ul>
              );
            } else {
              blocks.push(
                <ol key={key} className="list-decimal pl-5 my-2 space-y-1 text-[#F5F7FA]">
                  {currentList.items.map((it, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {renderInline(it)}
                    </li>
                  ))}
                </ol>
              );
            }
            currentList = null;
          }
        };

        rawLines.forEach((line, lIdx) => {
          const trimmed = line.trim();

          // Empty line: flush
          if (!trimmed) {
            flushParagraph(`p-empty-${lIdx}`);
            flushList(`l-empty-${lIdx}`);
            return;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            flushParagraph(`p-h3-${lIdx}`);
            flushList(`l-h3-${lIdx}`);
            blocks.push(
              <h3 key={`h3-${lIdx}`} className="text-sm font-semibold text-[#F5F7FA] mt-4 mb-2 tracking-tight">
                {renderInline(trimmed.slice(4))}
              </h3>
            );
            return;
          }
          if (trimmed.startsWith('## ')) {
            flushParagraph(`p-h2-${lIdx}`);
            flushList(`l-h2-${lIdx}`);
            blocks.push(
              <h2 key={`h2-${lIdx}`} className="text-base font-semibold text-[#F5F7FA] mt-4 mb-2 tracking-tight">
                {renderInline(trimmed.slice(3))}
              </h2>
            );
            return;
          }
          if (trimmed.startsWith('# ')) {
            flushParagraph(`p-h1-${lIdx}`);
            flushList(`l-h1-${lIdx}`);
            blocks.push(
              <h1 key={`h1-${lIdx}`} className="text-lg font-semibold text-[#F5F7FA] mt-4 mb-2 tracking-tight">
                {renderInline(trimmed.slice(2))}
              </h1>
            );
            return;
          }

          // Unordered list item
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            flushParagraph(`p-ul-${lIdx}`);
            if (!currentList || currentList.type !== 'ul') {
              flushList(`l-switch-${lIdx}`);
              currentList = { type: 'ul', items: [] };
            }
            currentList.items.push(trimmed.slice(2));
            return;
          }

          // Ordered list item
          const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (olMatch) {
            flushParagraph(`p-ol-${lIdx}`);
            if (!currentList || currentList.type !== 'ol') {
              flushList(`l-switch-ol-${lIdx}`);
              currentList = { type: 'ol', items: [] };
            }
            currentList.items.push(olMatch[2]);
            return;
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            flushParagraph(`p-bq-${lIdx}`);
            flushList(`l-bq-${lIdx}`);
            blocks.push(
              <blockquote
                key={`bq-${lIdx}`}
                className="border-l-2 border-[#8B5CF6]/60 pl-3 my-2 text-xs italic text-[#A7AFBD]"
              >
                {renderInline(trimmed.slice(2))}
              </blockquote>
            );
            return;
          }

          // Regular paragraph line
          flushList(`l-text-${lIdx}`);
          currentParagraph.push(trimmed);
        });

        flushParagraph(`p-final-${sIdx}`);
        flushList(`l-final-${sIdx}`);

        return <div key={`text-block-${sIdx}`}>{blocks}</div>;
      })}
    </div>
  );
};
