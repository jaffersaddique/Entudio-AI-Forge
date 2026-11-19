import { useState } from 'react';
import { Loader2, Network, RefreshCw, Sparkles } from 'lucide-react';
import type { EngineeringProject, SystemArchitecture, WorkspaceSettings } from '../types';
import { generateArchitecture } from '../services/aiService';
import { buildDemoArchitecture } from '../data/sampleProjects';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { AiErrorBanner } from '../components/AiErrorBanner';

interface ArchitectureDesignerPageProps {
  projects: EngineeringProject[];
  activeProject: EngineeringProject | undefined;
  settings: WorkspaceSettings;
  onSelectProject: (id: string) => void;
  onUpdateProject: (updated: EngineeringProject) => void;
}

export function ArchitectureDesignerPage({
  projects,
  activeProject,
  settings,
  onSelectProject,
  onUpdateProject,
}: ArchitectureDesignerPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastSource, setLastSource] = useState<'gemini' | 'demo' | null>(null);

  const architecture: SystemArchitecture | undefined = activeProject?.architecture;

  const handleGenerate = async (forceDemo = false) => {
    if (!activeProject) return;
    setApiError(null);

    if (forceDemo || settings.demoModeEnabled) {
      const demoArch = buildDemoArchitecture({
        title: activeProject.title,
        domain: activeProject.domain,
        language: activeProject.language,
      });
      onUpdateProject({
        ...activeProject,
        architecture: demoArch,
        updatedAt: new Date().toISOString(),
      });
      setLastSource('demo');
      return;
    }

    setIsLoading(true);
    try {
      const { architecture: generated } = await generateArchitecture({
        title: activeProject.title,
        domain: activeProject.domain,
        language: activeProject.language,
        abstract: activeProject.plan.abstract,
        proposedSolution: activeProject.plan.proposedSolution,
        systemModules: activeProject.plan.systemModules.map((m) => ({
          name: m.name,
          description: m.description,
        })),
      });

      onUpdateProject({
        ...activeProject,
        architecture: generated,
        updatedAt: new Date().toISOString(),
      });
      setLastSource('gemini');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Architecture generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="rounded-xl border border-[#123447] bg-[#071824] p-10 text-center space-y-2">
        <Network className="w-8 h-8 text-[#5E7E92] mx-auto" />
        <p className="text-sm font-medium text-white">No project selected</p>
        <p className="text-xs text-[#7A9BB0]">
          Generate or save a project first to design its system architecture.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <section className="rounded-xl border border-[#123447] bg-[#071824] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="arch-project-select" className="text-xs font-medium text-[#7A9BB0]">
              Selected Project:
            </label>
            <select
              id="arch-project-select"
              value={activeProject.id}
              onChange={(e) => onSelectProject(e.target.value)}
              className="rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-[#7A9BB0]">
            {activeProject.domain} · {activeProject.difficulty} · {activeProject.language}
            {lastSource === 'demo' && ' · Generated in Demo Mode'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleGenerate(false)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Designing Architecture...
            </>
          ) : architecture ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Regenerate Architecture
            </>
          ) : (
            <>
              <Network className="w-4 h-4" />
              Generate Architecture
            </>
          )}
        </button>
      </section>

      {apiError && (
        <AiErrorBanner
          message={apiError}
          onRetry={() => void handleGenerate(false)}
          onUseDemo={() => void handleGenerate(true)}
        />
      )}

      {isLoading && (
        <div className="rounded-xl border border-[#123447] bg-[#071824] p-8 space-y-4">
          <div className="flex items-center gap-3 text-sm font-medium text-[#1EE0FF]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating project-specific architecture components, data flow, and Mermaid flowchart...
          </div>
          <div className="h-56 rounded-lg bg-[#040E16] animate-pulse border border-[#123447]" />
        </div>
      )}

      {!isLoading && !architecture && (
        <div className="rounded-xl border border-[#123447] bg-[#071824] p-10 text-center space-y-4">
          <Network className="w-9 h-9 text-[#09D5FC] mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-display text-base font-semibold text-white">
              No Architecture Diagram Yet for {activeProject.title}
            </h3>
            <p className="text-xs text-[#7A9BB0] leading-relaxed">
              Generate a tailored system architecture diagram, component specification, and data flow derived from this project&apos;s modules.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void handleGenerate(false)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg transition-colors cursor-pointer"
            >
              <Network className="w-4 h-4" />
              Generate Architecture
            </button>
            <button
              type="button"
              onClick={() => void handleGenerate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#1EE0FF] bg-[#09D5FC]/10 hover:bg-[#09D5FC]/18 border border-[#09D5FC]/35 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Architecture
            </button>
          </div>
        </div>
      )}

      {!isLoading && architecture && (
        <div className="space-y-6">
          {/* Interactive Mermaid Diagram */}
          <MermaidDiagram chart={architecture.mermaidDiagram} title={activeProject.title} />

          {/* Overview & Pattern */}
          <div className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-white">
                System Architecture Explanation
              </h3>
              <span className="text-xs font-medium text-[#1EE0FF]">
                Pattern: {architecture.architecturePattern}
              </span>
            </div>
            <p className="text-sm text-[#B6C7D4] leading-relaxed">{architecture.overview}</p>
          </div>

          {/* Main Components */}
          <div className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-4">
            <h3 className="font-display text-base font-semibold text-white">Main Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {architecture.mainComponents.map((comp, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#123447] bg-[#040E16] p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      {comp.name}
                    </span>
                    <span className="text-xs font-mono text-[#1EE0FF]">{comp.technology}</span>
                  </div>
                  <p className="text-xs text-[#B6C7D4] leading-relaxed">{comp.role}</p>
                  <div className="text-[11px] text-[#6E8E9F] pt-1">
                    Interface: <span className="text-[#B6C7D4]">{comp.interfaces}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Flow & Module Relationships */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-3">
              <h3 className="font-display text-base font-semibold text-white">Data Flow</h3>
              <ol className="space-y-2.5 text-sm text-[#B6C7D4]">
                {architecture.dataFlow.map((step, i) => (
                  <li key={i} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-3">
              <h3 className="font-display text-base font-semibold text-white">
                Module Relationships
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#123447] text-[#7A9BB0]">
                      <th className="py-2 pr-3">Source</th>
                      <th className="py-2 pr-3">Target</th>
                      <th className="py-2">Interaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#102B3B]">
                    {architecture.moduleRelationships.map((rel, i) => (
                      <tr key={i}>
                        <td className="py-2.5 pr-3 font-medium text-white">{rel.source}</td>
                        <td className="py-2.5 pr-3 font-medium text-[#1EE0FF]">{rel.target}</td>
                        <td className="py-2.5 text-[#8FAAB9]">{rel.interaction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
