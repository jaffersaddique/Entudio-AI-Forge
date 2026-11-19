export type NavPage =
  | 'dashboard'
  | 'generator'
  | 'architecture'
  | 'code-assistant'
  | 'tracker'
  | 'documentation'
  | 'saved-projects'
  | 'settings';

export type EngineeringDomain =
  | 'AI/ML'
  | 'Web Development'
  | 'IoT'
  | 'Robotics'
  | 'VLSI'
  | 'Embedded Systems'
  | 'Data Science'
  | 'Other';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TechStackCategory {
  category: string;
  tools: string[];
}

export interface SystemModule {
  name: string;
  description: string;
  responsibilities: string[];
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  duration: string;
  tasks: string[];
}

export interface ProjectPlan {
  abstract: string;
  problemStatement: string;
  objectives: string[];
  proposedSolution: string;
  technologyStack: TechStackCategory[];
  softwareRequirements: string[];
  hardwareRequirements: string[];
  systemModules: SystemModule[];
  roadmap: RoadmapPhase[];
  testingProcedures: string[];
  expectedResults: string[];
  sampleCodeSnippet: {
    language: string;
    filename: string;
    code: string;
  };
}

export interface ArchitectureComponent {
  name: string;
  role: string;
  technology: string;
  interfaces: string;
}

export interface ModuleRelationship {
  source: string;
  target: string;
  interaction: string;
}

export interface SystemArchitecture {
  overview: string;
  architecturePattern: string;
  mainComponents: ArchitectureComponent[];
  dataFlow: string[];
  moduleRelationships: ModuleRelationship[];
  mermaidDiagram: string;
}

export interface DocumentationTitlePage {
  title: string;
  subtitle: string;
  domain: string;
  difficulty: string;
  language: string;
  duration: string;
  preparedBy: string;
  institution: string;
  guideName: string;
  date: string;
}

export interface ProjectDocumentation {
  titlePage: DocumentationTitlePage;
  abstract: string;
  introduction: string;
  problemStatement: string;
  objectives: string[];
  existingSystem: string;
  proposedSystem: string;
  systemArchitecture: string;
  implementation: string;
  results: string;
  conclusion: string;
  futureScope: string;
}

export interface TrackerTask {
  id: string;
  title: string;
  phase: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  createdAt: string;
}

export interface ProjectNote {
  id: string;
  content: string;
  updatedAt: string;
}

export interface EngineeringProject {
  id: string;
  title: string;
  domain: EngineeringDomain;
  difficulty: DifficultyLevel;
  language: string;
  duration: string;
  createdAt: string;
  updatedAt: string;
  sourceMode: 'gemini' | 'demo' | 'sample';
  plan: ProjectPlan;
  architecture?: SystemArchitecture;
  documentation?: ProjectDocumentation;
  tasks: TrackerTask[];
  notes: ProjectNote[];
}

export type CodeAssistantMode = 'generate' | 'explain' | 'debug' | 'improve';

export interface CodeLineExplanation {
  lines: string;
  explanation: string;
}

export interface CodeFinding {
  severity: 'critical' | 'warning' | 'suggestion' | string;
  title: string;
  detail: string;
}

export interface CodeAssistantResult {
  summary: string;
  language: string;
  code: string;
  lineByLine: CodeLineExplanation[];
  findings: CodeFinding[];
  sourceMode?: 'gemini' | 'demo';
}

export interface WorkspaceSettings {
  userName: string;
  institution: string;
  guideName: string;
  defaultDomain: EngineeringDomain;
  defaultDifficulty: DifficultyLevel;
  defaultLanguage: string;
  demoModeEnabled: boolean;
}
