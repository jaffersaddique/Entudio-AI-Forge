import {
  CheckSquare,
  Code2,
  Cpu,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Network,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import type { EngineeringProject, NavPage } from '../types';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  activeProject: EngineeringProject | undefined;
  totalProjects: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{ id: NavPage; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'generator', label: 'AI Project Generator', icon: Cpu },
  { id: 'architecture', label: 'Architecture Designer', icon: Network },
  { id: 'code-assistant', label: 'Code Assistant', icon: Code2 },
  { id: 'tracker', label: 'Development Tracker', icon: CheckSquare },
  { id: 'documentation', label: 'Documentation Generator', icon: FileText },
  { id: 'saved-projects', label: 'Saved Projects', icon: FolderKanban },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar({
  activePage,
  onNavigate,
  activeProject,
  totalProjects,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const completedCount = activeProject
    ? activeProject.tasks.filter((t) => t.completed).length
    : 0;
  const totalTasks = activeProject ? activeProject.tasks.length : 0;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const content = (
    <div className="flex flex-col h-full bg-[#040E16] border-r border-[#123142] w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#123142]">
        <button
          type="button"
          onClick={() => {
            onNavigate('dashboard');
            onCloseMobile();
          }}
          className="flex items-center gap-3 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[radial-gradient(circle_at_30%_30%,#09D5FC_0%,#0B4E6B_48%,#071B29_100%)] border border-[#19536E] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
                stroke="#E6FAFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M12 12L20 7.5M12 12V21M12 12L4 7.5"
                stroke="#09D5FC"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm tracking-tight text-white whitespace-nowrap">
              ENTUDIO
            </div>
            <div className="text-[11px] font-medium text-[#7A9BB0] tracking-wider uppercase whitespace-nowrap">
              ProjectForge AI
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 text-[#7A9BB0] hover:text-white rounded-md cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Primary Sidebar Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#09D5FC]/12 text-[#1EE0FF] border border-[#09D5FC]/35'
                  : 'text-[#8FAAB9] hover:text-white hover:bg-[#091E2C] border border-transparent'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#09D5FC]' : 'text-[#5C7D91]'}`} />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'saved-projects' && (
                <span className="text-xs font-mono tabular-nums text-[#6E8E9F]">
                  {totalProjects}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Project Workspace Summary */}
      <div className="p-4 border-t border-[#123142]">
        {activeProject ? (
          <button
            type="button"
            onClick={() => {
              onNavigate('tracker');
              onCloseMobile();
            }}
            className="w-full text-left p-3 rounded-lg bg-[#071824] border border-[#123447] hover:border-[#1B4C66] transition-colors cursor-pointer"
          >
            <div className="text-[11px] font-medium text-[#7A9BB0]">Active Project</div>
            <div className="text-xs font-semibold text-white truncate mt-0.5">
              {activeProject.title}
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8FAAB9] tabular-nums">
              <span>{completedCount}/{totalTasks} tasks</span>
              <span>{progressPct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full bg-[#0E293A] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#09D5FC] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </button>
        ) : (
          <div className="p-3 rounded-lg bg-[#071824] border border-[#123447] text-xs text-[#7A9BB0]">
            No active project selected.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">{content}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full">{content}</aside>
        </div>
      )}
    </>
  );
}
