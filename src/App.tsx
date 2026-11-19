import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { EngineeringProject, NavPage, WorkspaceSettings } from './types';
import {
  clearAllWorkspaceData,
  loadActiveProjectId,
  loadProjects,
  loadSettings,
  resetToSampleProjects,
  saveActiveProjectId,
  saveProjects,
  saveSettings,
} from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectGeneratorPage } from './pages/ProjectGeneratorPage';
import { ArchitectureDesignerPage } from './pages/ArchitectureDesignerPage';
import { CodeAssistantPage } from './pages/CodeAssistantPage';
import { DevelopmentTrackerPage } from './pages/DevelopmentTrackerPage';
import { DocumentationGeneratorPage } from './pages/DocumentationGeneratorPage';
import { SavedProjectsPage } from './pages/SavedProjectsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [projects, setProjects] = useState<EngineeringProject[]>(() => loadProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    loadActiveProjectId(loadProjects())
  );
  const [settings, setSettings] = useState<WorkspaceSettings>(() => loadSettings());
  const [activePage, setActivePage] = useState<NavPage>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) {
      saveActiveProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0],
    [projects, activeProjectId]
  );

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
  };

  const handleSaveNewProject = (project: EngineeringProject) => {
    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(project.id);
  };

  const handleUpdateProject = (updated: EngineeringProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDuplicateProject = (project: EngineeringProject) => {
    const now = new Date().toISOString();
    const copy: EngineeringProject = {
      ...project,
      id: `proj-${Date.now()}`,
      title: `${project.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      tasks: project.tasks.map((t) => ({ ...t, id: `${t.id}-copy-${Date.now()}` })),
    };
    setProjects((prev) => [copy, ...prev]);
    setActiveProjectId(copy.id);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeProjectId === id) {
        setActiveProjectId(next[0]?.id ?? '');
      }
      return next;
    });
  };

  const handleSaveSettings = (next: WorkspaceSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const handleRestoreSamples = () => {
    const restored = resetToSampleProjects();
    setProjects(restored);
    setActiveProjectId(restored[0]?.id ?? '');
  };

  const handleClearAll = () => {
    clearAllWorkspaceData();
    setProjects([]);
    setActiveProjectId('');
  };

  const handleImportProjects = (imported: EngineeringProject[]) => {
    setProjects((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const merged = [
        ...imported.map((item) =>
          existingIds.has(item.id) ? { ...item, id: `${item.id}-${Date.now()}` } : item
        ),
        ...prev,
      ];
      return merged;
    });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#061824] via-[#05131D] to-[#040E16] text-slate-100">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        activeProject={activeProject}
        totalProjects={projects.length}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activePage={activePage}
          projects={projects}
          activeProjectId={activeProject?.id ?? ''}
          onSelectProject={handleSelectProject}
          onNavigate={setActivePage}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          demoModeEnabled={settings.demoModeEnabled}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1360px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activePage === 'dashboard' && (
                <DashboardPage
                  projects={projects}
                  activeProject={activeProject}
                  settings={settings}
                  onNavigate={setActivePage}
                  onSelectProject={handleSelectProject}
                />
              )}

              {activePage === 'generator' && (
                <ProjectGeneratorPage
                  settings={settings}
                  onSaveProject={handleSaveNewProject}
                  onNavigate={setActivePage}
                />
              )}

              {activePage === 'architecture' && (
                <ArchitectureDesignerPage
                  projects={projects}
                  activeProject={activeProject}
                  settings={settings}
                  onSelectProject={handleSelectProject}
                  onUpdateProject={handleUpdateProject}
                />
              )}

              {activePage === 'code-assistant' && (
                <CodeAssistantPage
                  activeProject={activeProject}
                  settings={settings}
                />
              )}

              {activePage === 'tracker' && (
                <DevelopmentTrackerPage
                  projects={projects}
                  activeProject={activeProject}
                  onSelectProject={handleSelectProject}
                  onUpdateProject={handleUpdateProject}
                />
              )}

              {activePage === 'documentation' && (
                <DocumentationGeneratorPage
                  projects={projects}
                  activeProject={activeProject}
                  settings={settings}
                  onSelectProject={handleSelectProject}
                  onUpdateProject={handleUpdateProject}
                />
              )}

              {activePage === 'saved-projects' && (
                <SavedProjectsPage
                  projects={projects}
                  activeProjectId={activeProject?.id ?? ''}
                  onSelectProject={handleSelectProject}
                  onUpdateProject={handleUpdateProject}
                  onDuplicateProject={handleDuplicateProject}
                  onDeleteProject={handleDeleteProject}
                  onNavigate={setActivePage}
                />
              )}

              {activePage === 'settings' && (
                <SettingsPage
                  settings={settings}
                  projects={projects}
                  onSaveSettings={handleSaveSettings}
                  onRestoreSamples={handleRestoreSamples}
                  onClearAll={handleClearAll}
                  onImportProjects={handleImportProjects}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
