import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';
import { Check, Copy, Download, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { copyToClipboard, downloadFile } from '../utils/exportUtils';

let mermaidInitialized = false;

function ensureMermaidInit() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'DM Sans, system-ui, sans-serif',
    themeVariables: {
      darkMode: true,
      background: '#040E16',
      primaryColor: '#0A2233',
      primaryTextColor: '#FFFFFF',
      primaryBorderColor: '#09D5FC',
      lineColor: '#1EE0FF',
      secondaryColor: '#071824',
      tertiaryColor: '#05131D',
      edgeLabelBackground: '#071824',
      clusterBkg: '#071824',
      clusterBorder: '#153F57',
    },
  });
  mermaidInitialized = true;
}

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

export function MermaidDiagram({ chart, title = 'architecture' }: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, '');
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function renderChart() {
      if (!chart.trim()) {
        setSvgMarkup('');
        return;
      }
      ensureMermaidInit();
      try {
        setRenderError(null);
        const renderId = `mermaid_${reactId}_${Date.now()}`;
        const { svg } = await mermaid.render(renderId, chart);
        if (!cancelled) {
          setSvgMarkup(svg);
        }
      } catch (err) {
        if (!cancelled) {
          setRenderError(err instanceof Error ? err.message : 'Unable to parse diagram syntax.');
          setSvgMarkup('');
        }
      }
    }
    renderChart();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  const handleCopySource = async () => {
    const ok = await copyToClipboard(chart);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgMarkup) return;
    downloadFile(`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-diagram.svg`, svgMarkup, 'image/svg+xml');
  };

  return (
    <div className="rounded-xl border border-[#123447] bg-[#040E16] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[#123447] bg-[#071824]">
        <span className="text-xs font-medium text-[#B6C7D4]">System Architecture Flowchart</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
            aria-label="Zoom out diagram"
            className="p-1.5 text-[#7A9BB0] hover:text-white hover:bg-[#0D2738] rounded-md transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono tabular-nums text-[#8FAAB9] w-11 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))}
            aria-label="Zoom in diagram"
            className="p-1.5 text-[#7A9BB0] hover:text-white hover:bg-[#0D2738] rounded-md transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            aria-label="Reset zoom"
            className="p-1.5 text-[#7A9BB0] hover:text-white hover:bg-[#0D2738] rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="h-4 w-px bg-[#123447] mx-1" />
          <button
            type="button"
            onClick={handleCopySource}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Mermaid'}
          </button>
          {svgMarkup && (
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#1EE0FF] bg-[#09D5FC]/12 hover:bg-[#09D5FC]/22 border border-[#09D5FC]/35 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export SVG
            </button>
          )}
        </div>
      </div>

      {renderError ? (
        <div className="p-5 space-y-3">
          <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-lg p-3">
            Mermaid syntax could not be rendered visually ({renderError}). Showing raw diagram specification below:
          </div>
          <pre className="text-xs font-mono text-[#B6C7D4] bg-[#071824] p-4 rounded-lg overflow-x-auto border border-[#123447]">
            {chart}
          </pre>
        </div>
      ) : svgMarkup ? (
        <div className="p-6 overflow-auto min-h-[280px] flex items-center justify-center">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150 ease-out"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        </div>
      ) : (
        <div className="p-10 text-center text-sm text-[#6E8E9F]">Rendering architecture diagram...</div>
      )}
    </div>
  );
}
