import {
  ArrowRight,
  CheckSquare,
  Code2,
  Cpu,
  FileText,
  FolderOpen,
  Network,
  Plus,
} from 'lucide-react';
import type { EngineeringProject, NavPage, WorkspaceSettings } from '../types';

interface DashboardPageProps {
  projects: EngineeringProject[];
  activeProject: EngineeringProject | undefined;
  settings: WorkspaceSettings;
  onNavigate: (page: NavPage) => void;
  onSelectProject: (id: string) => void;
}

export function DashboardPage({
  projects,
  activeProject,
  settings,
  onNavigate,
  onSelectProject,
}: DashboardPageProps) {
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.completed).length,
    0
  );
  const architecturesCount = projects.filter((p) => Boolean(p.architecture)).length;
  const reportsCount = projects.filter((p) => Boolean(p.documentation)).length;

  const quickTools: Array<{
    id: NavPage;
    title: string;
    description: string;
    icon: typeof Cpu;
  }> = [
    {
      id: 'generator',
      title: 'AI Project Generator',
      description: 'Convert a raw idea into a structured abstract, modules, stack, and roadmap.',
      icon: Cpu,
    },
    {
      id: 'architecture',
      title: 'Architecture Designer',
      description: 'Generate component breakdowns, data flow, and Mermaid diagrams.',
      icon: Network,
    },
    {
      id: 'code-assistant',
      title: 'AI Code Assistant',
      description: 'Generate source code, explain logic line by line, and catch bugs early.',
      icon: Code2,
    },
    {
      id: 'tracker',
      title: 'Development Tracker',
      description: 'Manage engineering milestones, checklists, and implementation notes.',
      icon: CheckSquare,
    },
    {
      id: 'documentation',
      title: 'Documentation Generator',
      description: 'Compile a 12-section project report ready for Markdown, TXT, or PDF export.',
      icon: FileText,
    },
  ];

  const sortedHistory = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const openProjectIn = (projectId: string, page: NavPage) => {
    onSelectProject(projectId);
    onNavigate(page);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-xl border border-[#123447] bg-gradient-to-br from-[#071D2B] via-[#061722] to-[#040E16] p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full border border-[#123F54]/50 bg-[radial-gradient(circle,rgba(9,213,252,0.08)_0%,rgba(9,213,252,0)_70%)]"
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="text-xs font-medium text-[#1EE0FF] tracking-wide">
              ENTUDIO ProjectForge AI · Engineering Workbench
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {settings.userName || 'Engineer'}
            </h2>
            <p className="text-sm sm:text-[15px] text-[#B6C7D4] leading-relaxed">
              Turn rough engineering concepts into structured system architectures, milestone roadmaps, starter code, and academic project reports in one workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('generator')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
            {activeProject && (
              <button
                type="button"
                onClick={() => onNavigate('architecture')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1EE0FF] bg-[#09D5FC]/10 hover:bg-[#09D5FC]/18 border border-[#09D5FC]/35 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Network className="w-4 h-4 text-[#09D5FC]" />
                Open Active Architecture
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Summary Metrics Row */}
      <section aria-label="Workspace Statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#123447] bg-[#071824] p-5">
          <div className="text-xs font-medium text-[#7A9BB0]">Total Projects</div>
          <div className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {projects.length}
          </div>
          <div className="mt-1 text-xs text-[#5E7E92]">Saved in workspace</div>
        </div>

        <div className="rounded-xl border border-[#123447] bg-[#071824] p-5">
          <div className="text-xs font-medium text-[#7A9BB0]">Tasks Completed</div>
          <div className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {completedTasks}
            <span className="text-base font-normal text-[#5E7E92]"> / {totalTasks}</span>
          </div>
          <div className="mt-1 text-xs text-[#5E7E92]">Across all roadmaps</div>
        </div>

        <div className="rounded-xl border border-[#123447] bg-[#071824] p-5">
          <div className="text-xs font-medium text-[#7A9BB0]">Architectures Designed</div>
          <div className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {architecturesCount}
          </div>
          <div className="mt-1 text-xs text-[#5E7E92]">With Mermaid flowcharts</div>
        </div>

        <div className="rounded-xl border border-[#123447] bg-[#071824] p-5">
          <div className="text-xs font-medium text-[#7A9BB0]">Reports Generated</div>
          <div className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {reportsCount}
          </div>
          <div className="mt-1 text-xs text-[#5E7E92]">Exportable documentation</div>
        </div>
      </section>

      {/* Quick Access to AI Tools */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-white">
            Quick Access to Engineering Tools
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onNavigate(tool.id)}
                className="group text-left rounded-xl border border-[#123447] bg-[#071824] hover:bg-[#0A2131] hover:border-[#1B4C66] p-5 transition-colors flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg border border-[#14435B] bg-[#09D5FC]/10 text-[#09D5FC] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-semibold text-white">
                      {tool.title}
                    </h4>
                    <p className="mt-1 text-xs text-[#8FAAB9] leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1EE0FF] group-hover:text-[#66EBFF]">
                  Launch tool
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recently Generated Projects & Project History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Recently Generated Projects &amp; History
            </h3>
            <p className="text-xs text-[#7A9BB0] mt-0.5">
              Select a project to inspect its architecture, track milestones, or generate documentation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('saved-projects')}
            className="text-xs font-medium text-[#1EE0FF] hover:text-[#66EBFF] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Manage all projects
          </button>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="rounded-xl border border-[#123447] bg-[#071824] p-10 text-center space-y-4">
            <FolderOpen className="w-8 h-8 text-[#5E7E92] mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">No projects in your workspace yet</p>
              <p className="text-xs text-[#7A9BB0]">
                Use the AI Project Generator to turn your first engineering idea into a complete plan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('generator')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-[#123447] bg-[#071824] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#123447] text-xs font-medium text-[#7A9BB0] bg-[#040E16]">
                    <th className="py-3 px-4">Project Title &amp; Details</th>
                    <th className="py-3 px-4 whitespace-nowrap">Progress</th>
                    <th className="py-3 px-4 whitespace-nowrap">Artifacts</th>
                    <th className="py-3 px-4 whitespace-nowrap">Last Updated</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102B3B] text-sm">
                  {sortedHistory.map((proj) => {
                    const done = proj.tasks.filter((t) => t.completed).length;
                    const total = proj.tasks.length;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    const isActive = activeProject?.id === proj.id;

                    return (
                      <tr
                        key={proj.id}
                        className={`hover:bg-[#0B2232]/70 transition-colors ${
                          isActive ? 'bg-[#09D5FC]/[0.06]' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 min-w-[260px]">
                          <div className="font-medium text-white flex items-center gap-2">
                            <span>{proj.title}</span>
                            {isActive && (
                              <span className="text-[11px] font-medium text-[#1EE0FF]">(Active)</span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#7A9BB0]">
                            <span>{proj.domain}</span>
                            <span aria-hidden="true">·</span>
                            <span>{proj.difficulty}</span>
                            <span aria-hidden="true">·</span>
                            <span>{proj.language}</span>
                            <span aria-hidden="true">·</span>
                            <span>{proj.duration}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-20 h-1.5 bg-[#0E293A] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#09D5FC]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono tabular-nums text-[#B6C7D4]">
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#7A9BB0] whitespace-nowrap">
                          <span>Plan</span>
                          {proj.architecture && (
                            <>
                              <span aria-hidden="true"> · </span>
                              <span className="text-[#1EE0FF]">Architecture</span>
                            </>
                          )}
                          {proj.documentation && (
                            <>
                              <span aria-hidden="true"> · </span>
                              <span className="text-[#7DD3FC]">Report</span>
                            </>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-[#7A9BB0] whitespace-nowrap">
                          {new Date(proj.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openProjectIn(proj.id, 'architecture')}
                              className="px-2.5 py-1.5 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-md transition-colors cursor-pointer"
                            >
                              Architecture
                            </button>
                            <button
                              type="button"
                              onClick={() => openProjectIn(proj.id, 'tracker')}
                              className="px-2.5 py-1.5 text-xs font-medium text-[#1EE0FF] hover:text-white bg-[#09D5FC]/12 hover:bg-[#09D5FC]/22 border border-[#09D5FC]/35 rounded-md transition-colors cursor-pointer"
                            >
                              Open
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
