import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

interface AiErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onUseDemo?: () => void;
  demoLabel?: string;
}

export function AiErrorBanner({
  message,
  onRetry,
  onUseDemo,
  demoLabel = 'Load Sample Output (Demo Mode)',
}: AiErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-500/35 bg-[#190D16] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-rose-200">AI Generation Unavailable</p>
          <p className="text-xs text-rose-200/80 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0B2232] hover:bg-[#103046] border border-[#143D54] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        {onUseDemo && (
          <button
            type="button"
            onClick={onUseDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1EE0FF] bg-[#09D5FC]/12 hover:bg-[#09D5FC]/22 border border-[#09D5FC]/35 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {demoLabel}
          </button>
        )}
      </div>
    </div>
  );
}
