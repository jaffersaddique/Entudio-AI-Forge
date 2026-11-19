import type {
  CodeAssistantMode,
  CodeAssistantResult,
  DifficultyLevel,
  EngineeringDomain,
  EngineeringProject,
  ProjectDocumentation,
  ProjectPlan,
  SystemArchitecture,
} from '../types';

export class AiApiError extends Error {
  status: number;
  code: string;
  demoAvailable: boolean;

  constructor(message: string, status = 500, code = 'AI_ERROR', demoAvailable = true) {
    super(message);
    this.name = 'AiApiError';
    this.status = status;
    this.code = code;
    this.demoAvailable = demoAvailable;
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AiApiError(
      data.error || `Request failed with status ${response.status}`,
      response.status,
      data.code || 'AI_ERROR',
      Boolean(data.demoAvailable ?? true)
    );
  }
  return data as T;
}

export async function checkAiStatus(): Promise<{ ok: boolean; aiConfigured: boolean; model: string }> {
  const response = await fetch('/api/health');
  if (!response.ok) {
    return { ok: false, aiConfigured: false, model: 'gemini-4-hydrogen' };
  }
  return response.json();
}

export async function generateProjectPlan(input: {
  title: string;
  domain: EngineeringDomain;
  difficulty: DifficultyLevel;
  language: string;
  duration: string;
}): Promise<{ plan: ProjectPlan; source: 'gemini' }> {
  return postJson('/api/ai/project-plan', input);
}

export async function generateArchitecture(input: {
  title: string;
  domain: string;
  language: string;
  abstract?: string;
  proposedSolution?: string;
  systemModules?: Array<{ name: string; description: string }>;
}): Promise<{ architecture: SystemArchitecture; source: 'gemini' }> {
  return postJson('/api/ai/architecture', input);
}

export async function runCodeAssistant(input: {
  mode: CodeAssistantMode;
  language: string;
  input: string;
  projectContext?: string;
}): Promise<{ result: CodeAssistantResult; source: 'gemini' }> {
  return postJson('/api/ai/code-assistant', input);
}

export async function generateDocumentation(
  project: EngineeringProject,
  authorMeta: { preparedBy: string; institution: string; guideName: string }
): Promise<{ documentation: ProjectDocumentation; source: 'gemini' }> {
  return postJson('/api/ai/documentation', {
    project: {
      title: project.title,
      domain: project.domain,
      difficulty: project.difficulty,
      language: project.language,
      duration: project.duration,
      plan: project.plan,
      architecture: project.architecture,
    },
    authorMeta,
  });
}
