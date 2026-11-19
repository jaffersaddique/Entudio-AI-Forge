import type { EngineeringProject, WorkspaceSettings } from '../types';
import { INITIAL_SAMPLE_PROJECTS } from '../data/sampleProjects';

const PROJECTS_KEY = 'entudio_projectforge_projects_v1';
const ACTIVE_PROJECT_KEY = 'entudio_projectforge_active_id_v1';
const SETTINGS_KEY = 'entudio_projectforge_settings_v1';

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  userName: 'Alex Rivera',
  institution: 'Department of Computer & Systems Engineering',
  guideName: 'Dr. S. Kulkarni',
  defaultDomain: 'AI/ML',
  defaultDifficulty: 'Intermediate',
  defaultLanguage: 'Python',
  demoModeEnabled: false,
};

export function loadProjects(): EngineeringProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(INITIAL_SAMPLE_PROJECTS));
      return INITIAL_SAMPLE_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return INITIAL_SAMPLE_PROJECTS;
    }
    return parsed as EngineeringProject[];
  } catch {
    return INITIAL_SAMPLE_PROJECTS;
  }
}

export function saveProjects(projects: EngineeringProject[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to persist projects to LocalStorage:', err);
  }
}

export function loadActiveProjectId(projects: EngineeringProject[]): string {
  try {
    const stored = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (stored && projects.some((p) => p.id === stored)) {
      return stored;
    }
  } catch {
    // ignore storage access issues
  }
  return projects[0]?.id ?? '';
}

export function saveActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch {
    // ignore
  }
}

export function loadSettings(): WorkspaceSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: WorkspaceSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to persist settings:', err);
  }
}

export function resetToSampleProjects(): EngineeringProject[] {
  saveProjects(INITIAL_SAMPLE_PROJECTS);
  if (INITIAL_SAMPLE_PROJECTS[0]) {
    saveActiveProjectId(INITIAL_SAMPLE_PROJECTS[0].id);
  }
  return INITIAL_SAMPLE_PROJECTS;
}

export function clearAllWorkspaceData(): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify([]));
  localStorage.removeItem(ACTIVE_PROJECT_KEY);
}
