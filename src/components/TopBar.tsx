import { Menu, Plus, Sparkles } from 'lucide-react';
import type { EngineeringProject, NavPage } from '../types';

interface TopBarProps {
  activePage: NavPage;
  projects: EngineeringProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNavigate: (page: NavPage) => void;
  onOpenMobileMenu: () => void;
  demoModeEnabled: boolean;
}

const PAGE_TITLES: Record<NavPage, string> = {
  dashboard: 'Dashboard',
  generator: 'AI Project Generator',
  architecture: 'Architecture Designer',
  'code-assistant': 'Code Assistant',
  tracker: 'Development Tracker',
  documentation: 'Documentation Generator',
  'saved-projects': 'Saved Projects',
  settings: 'Settings',
};

export function TopBar({
  activePage,
  projects,
  activeProjectId,
  onSelectProject,
  onNavigate,
  onOpenMobileMenu,
  demoModeEnabled,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 border-b border-[#123142] bg-[#040E16]/95 backdrop-blur-md flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 text-[#8FAAB9] hover:text-white hover:bg-[#091E2C] rounded-lg cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="text-[#6E8E9F] hidden sm:inline whitespace-nowrap">Workspace</span>
          <span className="text-[#275166] hidden sm:inline" aria-hidden="true">/</span>
          <h1 className="font-display font-semibold text-white truncate">
            {PAGE_TITLES[activePage]}
          </h1>
        </div>

        {projects.length > 0 && (
          <div className="hidden md:flex items-center gap-2 pl-4 ml-2 border-l border-[#123142] min-w-0">
            <label htmlFor="topbar-project-select" className="text-xs text-[#6E8E9F] whitespace-nowrap">
              Project:
            </label>
            <select
              id="topbar-project-select"
              value={activeProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="max-w-[240px] truncate bg-[#071824] border border-[#14394E] hover:border-[#1E526E] text-xs font-medium text-[#E2F0F7] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {demoModeEnabled && (
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1EE0FF] bg-[#09D5FC]/10 border border-[#09D5FC]/35 rounded-full hover:bg-[#09D5FC]/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#09D5FC]" />
            Demo Mode Active
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigate('generator')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
    </header>
  );
}
