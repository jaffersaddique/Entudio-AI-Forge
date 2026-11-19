import { useMemo, useState } from 'react';
import hljs from 'highlight.js';
import { Check, Copy, Download } from 'lucide-react';
import { copyToClipboard, downloadFile } from '../utils/exportUtils';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  maxHeightClass?: string;
}

export function CodeBlock({
  code,
  language = 'python',
  filename,
  maxHeightClass = 'max-h-[480px]',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlightedHtml = useMemo(() => {
    const normalizedLang = language.toLowerCase().replace(/[^a-z0-9+#]/g, '');
    const langMap: Record<string, string> = {
      typescriptjavascript: 'typescript',
      'c++': 'cpp',
      verilogvhdl: 'verilog',
    };
    const targetLang = langMap[normalizedLang] || normalizedLang;

    try {
      if (targetLang && hljs.getLanguage(targetLang)) {
        return hljs.highlight(code, { language: targetLang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [code, language]);

  const lines = useMemo(() => code.split('\n'), [code]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      python: 'py',
      typescript: 'ts',
      javascript: 'js',
      cpp: 'cpp',
      'c++': 'cpp',
      c: 'c',
      java: 'java',
      rust: 'rs',
      go: 'go',
      sql: 'sql',
      verilog: 'v',
    };
    const ext = extMap[language.toLowerCase()] || 'txt';
    const name = filename || `snippet.${ext}`;
    downloadFile(name, code);
  };

  return (
    <div className="rounded-xl border border-[#123447] bg-[#040E16] overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-[#123447] bg-[#071824]">
        <div className="flex items-center gap-2 text-xs text-[#7A9BB0] font-mono min-w-0">
          {filename && <span className="text-white font-medium truncate">{filename}</span>}
          {filename && <span aria-hidden="true">·</span>}
          <span className="text-[#1EE0FF]">{language}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{lines.length} lines</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#1EE0FF] bg-[#09D5FC]/12 hover:bg-[#09D5FC]/22 border border-[#09D5FC]/35 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#09D5FC]" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>
      </div>

      <div className={`overflow-auto ${maxHeightClass} p-4 text-[13px] leading-6 font-mono`}>
        <div className="flex min-w-max">
          <div
            aria-hidden="true"
            className="select-none pr-4 mr-4 border-r border-[#123447] text-right text-[#496A7D] tabular-nums"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="m-0 flex-1 overflow-visible">
            <code
              className="hljs block"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
}
