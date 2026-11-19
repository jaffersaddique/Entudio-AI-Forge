import { useState, type FormEvent } from 'react';
import {
  BookmarkPlus,
  Check,
  Copy,
  Cpu,
  FileText,
  Loader2,
  Network,
  Sparkles,
} from 'lucide-react';
import type {
  DifficultyLevel,
  EngineeringDomain,
  EngineeringProject,
  NavPage,
  ProjectPlan,
  WorkspaceSettings,
} from '../types';
import { generateProjectPlan } from '../services/aiService';
import { buildDemoProjectPlan, createTasksFromPlan } from '../data/sampleProjects';
import { copyToClipboard, formatProjectPlanMarkdown } from '../utils/exportUtils';
import { CodeBlock } from '../components/CodeBlock';
import { AiErrorBanner } from '../components/AiErrorBanner';

interface ProjectGeneratorPageProps {
  settings: WorkspaceSettings;
  onSaveProject: (project: EngineeringProject) => void;
  onNavigate: (page: NavPage) => void;
}

const DOMAINS: EngineeringDomain[] = [
  'AI/ML',
  'Web Development',
  'IoT',
  'Robotics',
  'VLSI',
  'Embedded Systems',
  'Data Science',
  'Other',
];

const DIFFICULTIES: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

const LANGUAGES = [
  'Python',
  'TypeScript / JavaScript',
  'C++',
  'C',
  'Java',
  'Rust',
  'Verilog / VHDL',
  'Go',
  'Other',
];

const DURATIONS = ['2 Weeks', '4 Weeks', '6 Weeks', '8 Weeks', '12 Weeks', '16 Weeks'];

const SAMPLE_IDEAS: Array<{
  title: string;
  domain: EngineeringDomain;
  difficulty: DifficultyLevel;
  language: string;
}> = [
  {
    title: 'AI-powered attendance management system',
    domain: 'AI/ML',
    difficulty: 'Intermediate',
    language: 'Python',
  },
  {
    title: 'Smart campus microgrid energy monitor with ESP32 and MQTT',
    domain: 'IoT',
    difficulty: 'Intermediate',
    language: 'C++',
  },
  {
    title: 'Real-time student code plagiarism and complexity analyzer',
    domain: 'Web Development',
    difficulty: 'Advanced',
    language: 'TypeScript / JavaScript',
  },
  {
    title: 'FPGA-based low-latency UART and SPI protocol controller',
    domain: 'VLSI',
    difficulty: 'Advanced',
    language: 'Verilog / VHDL',
  },
];

export function ProjectGeneratorPage({
  settings,
  onSaveProject,
  onNavigate,
}: ProjectGeneratorPageProps) {
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState<EngineeringDomain>(settings.defaultDomain);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(settings.defaultDifficulty);
  const [language, setLanguage] = useState<string>(settings.defaultLanguage);
  const [duration, setDuration] = useState<string>('8 Weeks');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [generatedPlan, setGeneratedPlan] = useState<ProjectPlan | null>(null);
  const [generatedMeta, setGeneratedMeta] = useState<{
    title: string;
    domain: EngineeringDomain;
    difficulty: DifficultyLevel;
    language: string;
    duration: string;
    sourceMode: 'gemini' | 'demo';
  } | null>(null);

  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const runGeneration = async (forceDemo = false) => {
    const trimmed = title.trim();
    if (trimmed.length < 4) {
      setValidationError('Please enter a project title or idea of at least 4 characters.');
      return;
    }

    setValidationError(null);
    setApiError(null);
    setSavedProjectId(null);

    if (forceDemo || settings.demoModeEnabled) {
      const demoPlan = buildDemoProjectPlan({
        title: trimmed,
        domain,
        difficulty,
        language,
        duration,
      });
      setGeneratedPlan(demoPlan);
      setGeneratedMeta({
        title: trimmed,
        domain,
        difficulty,
        language,
        duration,
        sourceMode: 'demo',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { plan } = await generateProjectPlan({
        title: trimmed,
        domain,
        difficulty,
        language,
        duration,
      });
      setGeneratedPlan(plan);
      setGeneratedMeta({
        title: trimmed,
        domain,
        difficulty,
        language,
        duration,
        sourceMode: 'gemini',
      });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to generate project plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runGeneration(false);
  };

  const persistGeneratedProject = (redirectAfter?: NavPage) => {
    if (!generatedPlan || !generatedMeta) return;
    if (savedProjectId) {
      if (redirectAfter) onNavigate(redirectAfter);
      return;
    }

    const now = new Date().toISOString();
    const newProject: EngineeringProject = {
      id: `proj-${Date.now()}`,
      title: generatedMeta.title,
      domain: generatedMeta.domain,
      difficulty: generatedMeta.difficulty,
      language: generatedMeta.language,
      duration: generatedMeta.duration,
      createdAt: now,
      updatedAt: now,
      sourceMode: generatedMeta.sourceMode,
      plan: generatedPlan,
      tasks: createTasksFromPlan(generatedPlan),
      notes: [],
    };
    onSaveProject(newProject);
    setSavedProjectId(newProject.id);
    if (redirectAfter) {
      onNavigate(redirectAfter);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <section className="rounded-xl border border-[#123447] bg-[#071824] p-6">
        <div className="space-y-1 mb-6">
          <h2 className="font-display text-xl font-bold text-white">
            Generate an Engineering Project Plan
          </h2>
          <p className="text-sm text-[#8FAAB9]">
            Describe your project concept and parameters. ProjectForge AI produces an abstract, objectives, module breakdown, tech stack, roadmap, and starter code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="project-idea-input" className="block text-xs font-medium text-[#B6C7D4]">
              Project Title or Idea
            </label>
            <input
              id="project-idea-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g., AI-powered attendance management system"
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-4 py-2.5 text-sm text-white placeholder:text-[#567488] focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 focus:border-[#09D5FC]"
            />
            {validationError && (
              <p className="text-xs text-rose-400">{validationError}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[#6E8E9F]">Try an example:</span>
              {SAMPLE_IDEAS.map((idea) => (
                <button
                  key={idea.title}
                  type="button"
                  onClick={() => {
                    setTitle(idea.title);
                    setDomain(idea.domain);
                    setDifficulty(idea.difficulty);
                    setLanguage(idea.language);
                    setValidationError(null);
                  }}
                  className="text-xs text-[#B6C7D4] hover:text-white bg-[#0A2233] hover:bg-[#0E2E44] border border-[#153F57] rounded-md px-2.5 py-1 transition-colors cursor-pointer"
                >
                  {idea.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="domain-select" className="block text-xs font-medium text-[#B6C7D4]">
                Engineering Domain
              </label>
              <select
                id="domain-select"
                value={domain}
                onChange={(e) => setDomain(e.target.value as EngineeringDomain)}
                className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 cursor-pointer"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="difficulty-select" className="block text-xs font-medium text-[#B6C7D4]">
                Difficulty Level
              </label>
              <select
                id="difficulty-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 cursor-pointer"
              >
                {DIFFICULTIES.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="language-select" className="block text-xs font-medium text-[#B6C7D4]">
                Preferred Language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="duration-select" className="block text-xs font-medium text-[#B6C7D4]">
                Project Duration
              </label>
              <select
                id="duration-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 cursor-pointer"
              >
                {DURATIONS.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-xs text-[#7A9BB0]">
              {settings.demoModeEnabled
                ? 'Demo Mode is active in Settings. Sample outputs will be generated offline.'
                : 'Powered by Google Gemini AI via server-side generation.'}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Project Plan...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Generate Project
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Error Display */}
      {apiError && (
        <AiErrorBanner
          message={apiError}
          onRetry={() => void runGeneration(false)}
          onUseDemo={() => void runGeneration(true)}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-[#123447] bg-[#071824] p-8 space-y-4">
          <div className="flex items-center gap-3 text-sm font-medium text-[#1EE0FF]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Synthesizing structured project plan, modules, and roadmap with Gemini AI...
          </div>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-[#0D283A] rounded w-3/4" />
            <div className="h-4 bg-[#0D283A] rounded w-full" />
            <div className="h-4 bg-[#0D283A] rounded w-5/6" />
          </div>
        </div>
      )}

      {/* Generated Output */}
      {!isLoading && generatedPlan && generatedMeta && (
        <div className="space-y-6">
          {/* Output Action Toolbar */}
          <div className="rounded-xl border border-[#123447] bg-[#081C2B] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-bold text-white">
                  {generatedMeta.title}
                </h3>
                {generatedMeta.sourceMode === 'demo' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1EE0FF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Demo Mode Sample Output
                  </span>
                )}
              </div>
              <div className="text-xs text-[#7A9BB0]">
                {generatedMeta.domain} · {generatedMeta.difficulty} · {generatedMeta.language} · {generatedMeta.duration}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  void handleCopy('full', formatProjectPlanMarkdown(generatedMeta, generatedPlan))
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedKey === 'full' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === 'full' ? 'Copied Plan' : 'Copy Full Plan'}
              </button>

              <button
                type="button"
                onClick={() => persistGeneratedProject()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {savedProjectId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Saved to Workspace
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    Save Project
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => persistGeneratedProject('architecture')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1EE0FF] bg-[#09D5FC]/10 hover:bg-[#09D5FC]/18 border border-[#09D5FC]/35 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Network className="w-3.5 h-3.5" />
                Design Architecture
              </button>

              <button
                type="button"
                onClick={() => persistGeneratedProject('documentation')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] border border-[#153F57] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Generate Report
              </button>
            </div>
          </div>

          {/* Structured Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard
              title="Project Abstract"
              content={generatedPlan.abstract}
              copied={copiedKey === 'abstract'}
              onCopy={() => void handleCopy('abstract', generatedPlan.abstract)}
            />
            <SectionCard
              title="Problem Statement"
              content={generatedPlan.problemStatement}
              copied={copiedKey === 'problem'}
              onCopy={() => void handleCopy('problem', generatedPlan.problemStatement)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-display text-base font-semibold text-white">Objectives</h4>
                <CopyMiniButton
                  copied={copiedKey === 'objectives'}
                  onClick={() => void handleCopy('objectives', generatedPlan.objectives.join('\n'))}
                />
              </div>
              <ul className="space-y-2 text-sm text-[#B6C7D4]">
                {generatedPlan.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-xs text-[#09D5FC] mt-1 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <SectionCard
              title="Proposed Solution"
              content={generatedPlan.proposedSolution}
              copied={copiedKey === 'solution'}
              onCopy={() => void handleCopy('solution', generatedPlan.proposedSolution)}
            />
          </div>

          {/* Technology Stack & Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-4">
              <h4 className="font-display text-base font-semibold text-white">Technology Stack</h4>
              <div className="space-y-3">
                {generatedPlan.technologyStack.map((cat) => (
                  <div key={cat.category} className="border-b border-[#102E40] pb-2.5 last:border-none last:pb-0">
                    <div className="text-xs font-semibold text-[#1EE0FF]">{cat.category}</div>
                    <div className="text-xs text-[#B6C7D4] mt-1 leading-relaxed">
                      {cat.tools.join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-3">
              <h4 className="font-display text-base font-semibold text-white">Software Requirements</h4>
              <ul className="space-y-2 text-xs text-[#B6C7D4] leading-relaxed">
                {generatedPlan.softwareRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#09D5FC]">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-3">
              <h4 className="font-display text-base font-semibold text-white">Hardware Requirements</h4>
              <ul className="space-y-2 text-xs text-[#B6C7D4] leading-relaxed">
                {generatedPlan.hardwareRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#67E8F9]">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* System Modules */}
          <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-4">
            <h4 className="font-display text-base font-semibold text-white">System Modules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedPlan.systemModules.map((mod, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#123447] bg-[#040E16] p-4 space-y-2"
                >
                  <div className="font-display text-sm font-semibold text-white">
                    {String(idx + 1).padStart(2, '0')}. {mod.name}
                  </div>
                  <p className="text-xs text-[#7A9BB0] leading-relaxed">{mod.description}</p>
                  <ul className="pt-1 space-y-1 text-xs text-[#B6C7D4]">
                    {mod.responsibilities.map((r, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <span className="text-[#09D5FC]">–</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Development Roadmap */}
          <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-4">
            <h4 className="font-display text-base font-semibold text-white">
              Step-by-Step Development Roadmap
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {generatedPlan.roadmap.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#123447] bg-[#040E16] p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#1EE0FF]">{step.phase}</span>
                    <span className="text-[#6E8E9F] font-mono">{step.duration}</span>
                  </div>
                  <div className="text-sm font-semibold text-white">{step.title}</div>
                  <ul className="space-y-1.5 text-xs text-[#B6C7D4]">
                    {step.tasks.map((task, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2">
                        <span className="text-[#09D5FC]">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Testing & Expected Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-3">
              <h4 className="font-display text-base font-semibold text-white">Testing Procedures</h4>
              <ul className="space-y-2 text-sm text-[#B6C7D4]">
                {generatedPlan.testingProcedures.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="font-mono text-xs text-[#7A9BB0] mt-1 tabular-nums">
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-3">
              <h4 className="font-display text-base font-semibold text-white">Expected Results</h4>
              <ul className="space-y-2 text-sm text-[#B6C7D4]">
                {generatedPlan.expectedResults.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="font-mono text-xs text-[#1EE0FF] mt-1 tabular-nums">
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sample Starter Code */}
          {generatedPlan.sampleCodeSnippet && (
            <div className="space-y-3">
              <h4 className="font-display text-base font-semibold text-white">
                Starter Implementation Snippet
              </h4>
              <CodeBlock
                code={generatedPlan.sampleCodeSnippet.code}
                language={generatedPlan.sampleCodeSnippet.language}
                filename={generatedPlan.sampleCodeSnippet.filename}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CopyMiniButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#8FAAB9] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function SectionCard({
  title,
  content,
  copied,
  onCopy,
}: {
  title: string;
  content: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#123447] bg-[#071824] p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-display text-base font-semibold text-white">{title}</h4>
        <CopyMiniButton copied={copied} onClick={onCopy} />
      </div>
      <p className="text-sm text-[#B6C7D4] leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}
