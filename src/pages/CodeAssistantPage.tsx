import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  Code2,
  Lightbulb,
  Loader2,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type {
  CodeAssistantMode,
  CodeAssistantResult,
  EngineeringProject,
  WorkspaceSettings,
} from '../types';
import { runCodeAssistant } from '../services/aiService';
import { buildDemoCodeAssistant } from '../data/sampleProjects';
import { CodeBlock } from '../components/CodeBlock';
import { AiErrorBanner } from '../components/AiErrorBanner';

interface CodeAssistantPageProps {
  activeProject: EngineeringProject | undefined;
  settings: WorkspaceSettings;
}

const LANGUAGES = [
  'Python',
  'TypeScript',
  'JavaScript',
  'C++',
  'C',
  'Java',
  'Rust',
  'Go',
  'SQL',
  'Verilog',
];

const MODES: Array<{
  id: CodeAssistantMode;
  label: string;
  placeholder: string;
  sample: string;
}> = [
  {
    id: 'generate',
    label: 'Generate Code',
    placeholder: 'Describe the function, API endpoint, sensor driver, or algorithm you need...',
    sample:
      'Write a FastAPI endpoint and helper function that accepts a student_id and cosine confidence score, prevents duplicate attendance records within a 60-minute lecture window, and returns a structured JSON status.',
  },
  {
    id: 'explain',
    label: 'Explain Line-by-Line',
    placeholder: 'Paste source code here to receive a line-by-line engineering explanation...',
    sample: `def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    return dot / ((norm_a * norm_b) + 1e-10)`,
  },
  {
    id: 'debug',
    label: 'Find & Fix Errors',
    placeholder: 'Paste buggy code here to identify runtime errors, edge cases, and fixes...',
    sample: `def average_score(scores):
    total = 0
    for i in range(len(scores) + 1):
        total += scores[i]
    return total / len(scores)`,
  },
  {
    id: 'improve',
    label: 'Suggest Improvements',
    placeholder: 'Paste working code here to get refactoring, performance, and reliability improvements...',
    sample: `def find_user(users, target):
    for i in range(len(users)):
        if users[i]["email"] == target:
            return users[i]
    return None`,
  },
];

export function CodeAssistantPage({ activeProject, settings }: CodeAssistantPageProps) {
  const [mode, setMode] = useState<CodeAssistantMode>('generate');
  const [language, setLanguage] = useState<string>(
    activeProject?.language && LANGUAGES.includes(activeProject.language)
      ? activeProject.language
      : 'Python'
  );
  const [input, setInput] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<CodeAssistantResult | null>(null);

  const currentModeConfig = MODES.find((m) => m.id === mode) ?? MODES[0];

  const executeAssistant = async (forceDemo = false) => {
    if (!input.trim()) {
      setValidationError('Please enter a requirement or paste source code first.');
      return;
    }
    setValidationError(null);
    setApiError(null);

    if (forceDemo || settings.demoModeEnabled) {
      setResult(buildDemoCodeAssistant({ mode, language, input }));
      return;
    }

    setIsLoading(true);
    try {
      const projectContext =
        includeContext && activeProject
          ? `${activeProject.title} (${activeProject.domain}, ${activeProject.language}): ${activeProject.plan.abstract}`
          : undefined;
      const { result: aiResult } = await runCodeAssistant({
        mode,
        language,
        input,
        projectContext,
      });
      setResult({ ...aiResult, sourceMode: 'gemini' });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Code assistant request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void executeAssistant(false);
  };

  const renderSeverityBadge = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'error') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
          <AlertCircle className="w-3.5 h-3.5" />
          Critical
        </span>
      );
    }
    if (s === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1EE0FF]">
        <Lightbulb className="w-3.5 h-3.5" />
        Suggestion
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode & Input Panel */}
      <section className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Segmented Control */}
          <div
            role="tablist"
            aria-label="Code Assistant Modes"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#040E16] border border-[#123447]"
          >
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setMode(m.id);
                    setValidationError(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#09D5FC] text-[#04121C]'
                      : 'text-[#8FAAB9] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="code-lang-select" className="text-xs text-[#7A9BB0]">
              Language:
            </label>
            <select
              id="code-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="code-assistant-input" className="text-xs font-medium text-[#B6C7D4]">
                {mode === 'generate' ? 'Coding Requirement' : 'Source Code Input'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setInput(currentModeConfig.sample);
                  setValidationError(null);
                }}
                className="text-xs font-medium text-[#1EE0FF] hover:text-[#66EBFF] cursor-pointer"
              >
                Load sample input
              </button>
            </div>
            <textarea
              id="code-assistant-input"
              rows={7}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder={currentModeConfig.placeholder}
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] p-4 text-sm font-mono text-white placeholder:text-[#567488] focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
            {validationError && <p className="text-xs text-rose-400">{validationError}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {activeProject ? (
              <label className="inline-flex items-center gap-2 text-xs text-[#B6C7D4] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeContext}
                  onChange={(e) => setIncludeContext(e.target.checked)}
                  className="rounded border-[#1B4C66] bg-[#040E16] accent-[#09D5FC]"
                />
                Include context from active project ({activeProject.title})
              </label>
            ) : (
              <span className="text-xs text-[#6E8E9F]">Standalone coding workspace</span>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Gemini...
                </>
              ) : (
                <>
                  {mode === 'debug' ? (
                    <Bug className="w-4 h-4" />
                  ) : mode === 'improve' ? (
                    <Wrench className="w-4 h-4" />
                  ) : (
                    <Code2 className="w-4 h-4" />
                  )}
                  {currentModeConfig.label}
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {apiError && (
        <AiErrorBanner
          message={apiError}
          onRetry={() => void executeAssistant(false)}
          onUseDemo={() => void executeAssistant(true)}
        />
      )}

      {isLoading && (
        <div className="rounded-xl border border-[#123447] bg-[#071824] p-8 space-y-3">
          <div className="flex items-center gap-3 text-sm font-medium text-[#1EE0FF]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing {language} code request...
          </div>
          <div className="h-32 rounded-lg bg-[#040E16] animate-pulse border border-[#123447]" />
        </div>
      )}

      {!isLoading && result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-white">Summary</h3>
              {result.sourceMode === 'demo' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1EE0FF]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Demo Mode Sample
                </span>
              )}
            </div>
            <p className="text-sm text-[#B6C7D4] leading-relaxed">{result.summary}</p>
          </div>

          {/* Code Block */}
          {result.code && (
            <CodeBlock
              code={result.code}
              language={result.language || language}
              filename={`forge_${mode}`}
            />
          )}

          {/* Findings (Errors & Improvements) */}
          {result.findings && result.findings.length > 0 && (
            <div className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-4">
              <h3 className="font-display text-base font-semibold text-white">
                Findings &amp; Recommendations
              </h3>
              <div className="divide-y divide-[#102B3B]">
                {result.findings.map((finding, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      {renderSeverityBadge(finding.severity)}
                      <span className="text-sm font-semibold text-white">{finding.title}</span>
                    </div>
                    <p className="text-xs text-[#B6C7D4] leading-relaxed">{finding.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line-by-Line Explanation */}
          {result.lineByLine && result.lineByLine.length > 0 && (
            <div className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-4">
              <h3 className="font-display text-base font-semibold text-white">
                Line-by-Line Walkthrough
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#123447] text-xs font-medium text-[#7A9BB0]">
                      <th className="py-2 pr-4 whitespace-nowrap">Line Scope</th>
                      <th className="py-2">Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#102B3B]">
                    {result.lineByLine.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-3 pr-4 align-top font-mono text-xs text-[#1EE0FF] whitespace-nowrap">
                          {row.lines}
                        </td>
                        <td className="py-3 text-xs sm:text-sm text-[#B6C7D4] leading-relaxed">
                          {row.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
