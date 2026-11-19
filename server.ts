import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        throw err;
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }
  throw lastError;
}

function handleAiError(res: Response, err: unknown, fallbackLabel: string) {
  const status = (err as { status?: number })?.status || 500;
  const rawMessage = err instanceof Error ? err.message : String(err);

  let message = `${fallbackLabel} failed: ${rawMessage}`;
  let code = 'AI_UPSTREAM_ERROR';

  if (status === 403 || rawMessage.includes('PERMISSION_DENIED')) {
    code = 'PERMISSION_DENIED';
    message = 'Gemini API permission denied. Please verify your GEMINI_API_KEY in Settings > Secrets.';
  } else if (status === 400 || rawMessage.includes('API_KEY_INVALID')) {
    code = 'API_KEY_INVALID';
    message = 'Invalid Gemini API key or malformed request. Please check Settings > Secrets.';
  } else if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    code = 'RESOURCE_EXHAUSTED';
    message = 'Gemini API rate limit or quota exceeded. Wait a moment and retry, or switch to Demo Mode.';
  } else if (status === 404 || rawMessage.includes('NOT_FOUND')) {
    code = 'MODEL_NOT_FOUND';
    message = 'Requested Gemini model is unavailable. Please try again later.';
  }

  return res.status(status >= 400 && status < 600 ? status : 500).json({
    error: message,
    code,
    demoAvailable: true,
  });
}

function sanitizeMermaid(diagram: string): string {
  let cleaned = diagram.trim();
  cleaned = cleaned.replace(/^```(?:mermaid)?\s*/i, '').replace(/\s*```$/i, '').trim();
  if (!/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram)/i.test(cleaned)) {
    cleaned = `flowchart TD\n${cleaned}`;
  }
  return cleaned;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const aiConfigured = Boolean(getAiClient());
    res.json({
      ok: true,
      aiConfigured,
      model: MODEL_NAME,
    });
  });

  app.post('/api/ai/project-plan', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Add it in Settings > Secrets or use Demo Mode.',
        code: 'MISSING_API_KEY',
        demoAvailable: true,
      });
    }

    const { title, domain, difficulty, language, duration } = req.body as {
      title?: string;
      domain?: string;
      difficulty?: string;
      language?: string;
      duration?: string;
    };

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title or idea is required.' });
    }

    try {
      const prompt = `You are a senior engineering mentor and technical architect guiding college students and aspiring engineers.
Create a detailed, practical, and implementation-ready engineering project plan for:
- Project Idea / Title: ${title.trim()}
- Engineering Domain: ${domain || 'Software & AI'}
- Difficulty Level: ${difficulty || 'Intermediate'}
- Preferred Programming Language: ${language || 'Python'}
- Target Project Duration: ${duration || '8 Weeks'}

Ensure all technical choices, libraries, modules, roadmap milestones, testing procedures, and starter code are concrete, accurate, and tailored specifically to this project and skill level.`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'Return strictly valid JSON matching the provided schema. Keep explanations crisp, technical, and educational.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                abstract: { type: Type.STRING, description: 'Concise 1-2 paragraph engineering abstract.' },
                problemStatement: { type: Type.STRING, description: 'Clear statement of the real-world problem and limitations of current approaches.' },
                objectives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '4 to 6 measurable technical objectives.',
                },
                proposedSolution: { type: Type.STRING, description: 'Detailed explanation of how the proposed system solves the problem.' },
                technologyStack: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['category', 'tools'],
                  },
                },
                softwareRequirements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                hardwareRequirements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                systemModules: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['name', 'description', 'responsibilities'],
                  },
                },
                roadmap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phase: { type: Type.STRING },
                      title: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['phase', 'title', 'duration', 'tasks'],
                  },
                },
                testingProcedures: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                expectedResults: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                sampleCodeSnippet: {
                  type: Type.OBJECT,
                  properties: {
                    language: { type: Type.STRING },
                    filename: { type: Type.STRING },
                    code: { type: Type.STRING },
                  },
                  required: ['language', 'filename', 'code'],
                },
              },
              required: [
                'abstract',
                'problemStatement',
                'objectives',
                'proposedSolution',
                'technologyStack',
                'softwareRequirements',
                'hardwareRequirements',
                'systemModules',
                'roadmap',
                'testingProcedures',
                'expectedResults',
                'sampleCodeSnippet',
              ],
            },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({ error: 'Gemini returned an empty response.', demoAvailable: true });
      }
      const parsed = JSON.parse(rawText);
      return res.json({ plan: parsed, source: 'gemini' });
    } catch (err) {
      return handleAiError(res, err, 'Project plan generation');
    }
  });

  app.post('/api/ai/architecture', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Add it in Settings > Secrets or use Demo Mode.',
        code: 'MISSING_API_KEY',
        demoAvailable: true,
      });
    }

    const { title, domain, language, abstract, proposedSolution, systemModules } = req.body as {
      title?: string;
      domain?: string;
      language?: string;
      abstract?: string;
      proposedSolution?: string;
      systemModules?: Array<{ name: string; description: string }>;
    };

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required for architecture generation.' });
    }

    try {
      const moduleSummary = Array.isArray(systemModules) && systemModules.length > 0
        ? systemModules.map((m) => `- ${m.name}: ${m.description}`).join('\n')
        : 'Not specified yet — derive realistic modules from the project scope.';

      const prompt = `Design a concrete, domain-accurate system architecture for the following engineering project:
- Title: ${title}
- Domain: ${domain || 'Engineering'}
- Primary Language: ${language || 'Python'}
- Abstract: ${abstract || 'N/A'}
- Proposed Solution: ${proposedSolution || 'N/A'}
- Modules:\n${moduleSummary}

Also generate a clean, syntactically valid Mermaid.js flowchart (using "flowchart TD" or "flowchart LR").
IMPORTANT Mermaid syntax rules:
- Use simple alphanumeric node IDs like A, B, C, DB, API, UI (no spaces or special chars in IDs).
- Wrap every node label in double quotes inside square brackets, parentheses, or cylinders, e.g.:
  UI["Web Dashboard (React)"] --> API["REST API Gateway"]
  API --> DB[("PostgreSQL / Storage")]
- Never put unescaped quotes, parentheses, or brackets outside quotes inside labels, and avoid HTML tags.
- Include 7 to 12 connected nodes representing the actual system components of "${title}".`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'Return strictly valid JSON matching the schema. Ensure the Mermaid flowchart syntax is valid and uses double-quoted node labels.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING, description: 'Detailed explanation of the architectural pattern and design rationale.' },
                architecturePattern: { type: Type.STRING, description: 'e.g., Layered Pipeline, Edge-to-Cloud IoT, Microservices, MVC' },
                mainComponents: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      role: { type: Type.STRING },
                      technology: { type: Type.STRING },
                      interfaces: { type: Type.STRING },
                    },
                    required: ['name', 'role', 'technology', 'interfaces'],
                  },
                },
                dataFlow: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Ordered step-by-step data flow through the system.',
                },
                moduleRelationships: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      source: { type: Type.STRING },
                      target: { type: Type.STRING },
                      interaction: { type: Type.STRING },
                    },
                    required: ['source', 'target', 'interaction'],
                  },
                },
                mermaidDiagram: { type: Type.STRING, description: 'Valid Mermaid flowchart TD or LR definition.' },
              },
              required: [
                'overview',
                'architecturePattern',
                'mainComponents',
                'dataFlow',
                'moduleRelationships',
                'mermaidDiagram',
              ],
            },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({ error: 'Gemini returned an empty architecture response.', demoAvailable: true });
      }
      const parsed = JSON.parse(rawText);
      parsed.mermaidDiagram = sanitizeMermaid(parsed.mermaidDiagram || '');
      return res.json({ architecture: parsed, source: 'gemini' });
    } catch (err) {
      return handleAiError(res, err, 'Architecture generation');
    }
  });

  app.post('/api/ai/code-assistant', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Add it in Settings > Secrets or use Demo Mode.',
        code: 'MISSING_API_KEY',
        demoAvailable: true,
      });
    }

    const { mode, language, input, projectContext } = req.body as {
      mode?: 'generate' | 'explain' | 'debug' | 'improve';
      language?: string;
      input?: string;
      projectContext?: string;
    };

    if (!input || !input.trim()) {
      return res.status(400).json({ error: 'Please enter a coding requirement or paste source code.' });
    }

    const activeMode = mode || 'generate';
    const lang = language || 'Python';

    const modeInstructions: Record<string, string> = {
      generate: `Generate clean, well-structured, production-quality ${lang} source code for the requirement below. Also provide a line-by-line or logical-block explanation and any key best-practice notes.`,
      explain: `Explain the following ${lang} code clearly line-by-line (or logical statement-by-statement) for an engineering student. Return the original or cleanly formatted code in "code", a clear summary, and detailed entries in "lineByLine".`,
      debug: `Analyze the following ${lang} code carefully to find syntax errors, runtime bugs, edge-case failures, memory leaks, or security flaws. List every finding in "findings" with severity, and provide the corrected, working ${lang} code in "code".`,
      improve: `Review the following ${lang} code for performance, readability, modularity, error handling, and idiomatic style. List concrete improvements in "findings" and provide the refactored, improved ${lang} code in "code".`,
    };

    try {
      const prompt = `${modeInstructions[activeMode] || modeInstructions.generate}
${projectContext ? `\nProject Context: ${projectContext}\n` : ''}
Language: ${lang}
User Input:
${input.trim()}`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a senior software engineer and patient coding instructor. Return strictly valid JSON matching the schema.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING, description: 'High-level overview of the solution, explanation, or review.' },
                language: { type: Type.STRING },
                code: { type: Type.STRING, description: 'Complete generated, formatted, fixed, or improved source code.' },
                lineByLine: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      lines: { type: Type.STRING, description: 'Line numbers or snippet reference, e.g., Lines 1-4' },
                      explanation: { type: Type.STRING },
                    },
                    required: ['lines', 'explanation'],
                  },
                },
                findings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      severity: { type: Type.STRING, description: 'One of: critical, warning, suggestion' },
                      title: { type: Type.STRING },
                      detail: { type: Type.STRING },
                    },
                    required: ['severity', 'title', 'detail'],
                  },
                },
              },
              required: ['summary', 'language', 'code', 'lineByLine', 'findings'],
            },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({ error: 'Gemini returned an empty code response.', demoAvailable: true });
      }
      const parsed = JSON.parse(rawText);
      return res.json({ result: parsed, source: 'gemini' });
    } catch (err) {
      return handleAiError(res, err, 'Code assistant');
    }
  });

  app.post('/api/ai/documentation', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Add it in Settings > Secrets or use Demo Mode.',
        code: 'MISSING_API_KEY',
        demoAvailable: true,
      });
    }

    const { project, authorMeta } = req.body as {
      project?: Record<string, unknown>;
      authorMeta?: { preparedBy?: string; institution?: string; guideName?: string };
    };

    if (!project || !project.title) {
      return res.status(400).json({ error: 'Project details are required to generate documentation.' });
    }

    try {
      const prompt = `Generate a thorough, publication-ready academic engineering project report for the following project.
Project Data:
${JSON.stringify(project, null, 2)}

Author Metadata:
- Prepared By: ${authorMeta?.preparedBy || 'Engineering Project Team'}
- Institution: ${authorMeta?.institution || 'Department of Engineering'}
- Project Guide: ${authorMeta?.guideName || 'Faculty Mentor'}

Write rich, multi-paragraph academic prose for every section so the student can export it directly as a formal project report.`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'Return strictly valid JSON matching the schema. Write clear, formal, engineering-grade report sections.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                titlePage: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    domain: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    language: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    preparedBy: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    guideName: { type: Type.STRING },
                    date: { type: Type.STRING },
                  },
                  required: [
                    'title',
                    'subtitle',
                    'domain',
                    'difficulty',
                    'language',
                    'duration',
                    'preparedBy',
                    'institution',
                    'guideName',
                    'date',
                  ],
                },
                abstract: { type: Type.STRING },
                introduction: { type: Type.STRING },
                problemStatement: { type: Type.STRING },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                existingSystem: { type: Type.STRING },
                proposedSystem: { type: Type.STRING },
                systemArchitecture: { type: Type.STRING },
                implementation: { type: Type.STRING },
                results: { type: Type.STRING },
                conclusion: { type: Type.STRING },
                futureScope: { type: Type.STRING },
              },
              required: [
                'titlePage',
                'abstract',
                'introduction',
                'problemStatement',
                'objectives',
                'existingSystem',
                'proposedSystem',
                'systemArchitecture',
                'implementation',
                'results',
                'conclusion',
                'futureScope',
              ],
            },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({ error: 'Gemini returned an empty documentation response.', demoAvailable: true });
      }
      const parsed = JSON.parse(rawText);
      return res.json({ documentation: parsed, source: 'gemini' });
    } catch (err) {
      return handleAiError(res, err, 'Documentation generation');
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`ENTUDIO ProjectForge AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
