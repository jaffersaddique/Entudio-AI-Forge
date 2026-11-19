import { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileDown,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { EngineeringProject, ProjectDocumentation, WorkspaceSettings } from '../types';
import { generateDocumentation } from '../services/aiService';
import { buildDemoDocumentation } from '../data/sampleProjects';
import {
  copyToClipboard,
  downloadFile,
  exportDocumentationPdf,
  formatDocumentationMarkdown,
  formatDocumentationText,
  slugifyFilename,
} from '../utils/exportUtils';
import { AiErrorBanner } from '../components/AiErrorBanner';

interface DocumentationGeneratorPageProps {
  projects: EngineeringProject[];
  activeProject: EngineeringProject | undefined;
  settings: WorkspaceSettings;
  onSelectProject: (id: string) => void;
  onUpdateProject: (updated: EngineeringProject) => void;
}

export function DocumentationGeneratorPage({
  projects,
  activeProject,
  settings,
  onSelectProject,
  onUpdateProject,
}: DocumentationGeneratorPageProps) {
  const [preparedBy, setPreparedBy] = useState(settings.userName);
  const [institution, setInstitution] = useState(settings.institution);
  const [guideName, setGuideName] = useState(settings.guideName);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!activeProject) {
    return (
      <div className="rounded-xl border border-[#123447] bg-[#071824] p-10 text-center space-y-2">
        <FileText className="w-8 h-8 text-[#5E7E92] mx-auto" />
        <p className="text-sm font-medium text-white">No project selected</p>
        <p className="text-xs text-[#7A9BB0]">
          Select or generate a project first to compile an engineering project report.
        </p>
      </div>
    );
  }

  const doc: ProjectDocumentation | undefined = activeProject.documentation;

  const handleGenerate = async (forceDemo = false) => {
    setApiError(null);
    const meta = {
      preparedBy: preparedBy.trim() || settings.userName,
      institution: institution.trim() || settings.institution,
      guideName: guideName.trim() || settings.guideName,
    };

    if (forceDemo || settings.demoModeEnabled) {
      const demoDoc = buildDemoDocumentation(activeProject, meta);
      onUpdateProject({
        ...activeProject,
        documentation: demoDoc,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    setIsLoading(true);
    try {
      const { documentation } = await generateDocumentation(activeProject, meta);
      onUpdateProject({
        ...activeProject,
        documentation,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Documentation generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = async () => {
    if (!doc) return;
    const ok = await copyToClipboard(formatDocumentationMarkdown(doc));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!doc) return;
    downloadFile(
      `${slugifyFilename(activeProject.title)}-report.md`,
      formatDocumentationMarkdown(doc),
      'text/markdown;charset=utf-8'
    );
  };

  const handleDownloadText = () => {
    if (!doc) return;
    downloadFile(
      `${slugifyFilename(activeProject.title)}-report.txt`,
      formatDocumentationText(doc),
      'text/plain;charset=utf-8'
    );
  };

  const handleDownloadPdf = () => {
    if (!doc) return;
    exportDocumentationPdf(doc);
  };

  const sections = doc
    ? [
        { id: 'sec-title', label: 'Title Page' },
        { id: 'sec-abstract', label: '1. Abstract' },
        { id: 'sec-intro', label: '2. Introduction' },
        { id: 'sec-problem', label: '3. Problem Statement' },
        { id: 'sec-objectives', label: '4. Objectives' },
        { id: 'sec-existing', label: '5. Existing System' },
        { id: 'sec-proposed', label: '6. Proposed System' },
        { id: 'sec-arch', label: '7. System Architecture' },
        { id: 'sec-impl', label: '8. Implementation' },
        { id: 'sec-results', label: '9. Results' },
        { id: 'sec-conclusion', label: '10. Conclusion' },
        { id: 'sec-future', label: '11. Future Scope' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Report Configuration Header */}
      <section className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="doc-project-select" className="text-xs font-medium text-[#7A9BB0]">
              Source Project:
            </label>
            <select
              id="doc-project-select"
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

          <div className="flex flex-wrap items-center gap-2.5">
            {doc && (
              <>
                <button
                  type="button"
                  onClick={() => void handleCopyReport()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy Report'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  .MD
                </button>
                <button
                  type="button"
                  onClick={handleDownloadText}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  .TXT
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1EE0FF] bg-[#09D5FC]/12 hover:bg-[#09D5FC]/22 border border-[#09D5FC]/35 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Export PDF
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => void handleGenerate(false)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compiling Report...
                </>
              ) : doc ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Report
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Full Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Author Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#123447]">
          <div className="space-y-1">
            <label htmlFor="doc-author" className="block text-xs text-[#7A9BB0]">
              Prepared By (Student / Team)
            </label>
            <input
              id="doc-author"
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="doc-inst" className="block text-xs text-[#7A9BB0]">
              Department / Institution
            </label>
            <input
              id="doc-inst"
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="doc-guide" className="block text-xs text-[#7A9BB0]">
              Faculty Mentor / Project Guide
            </label>
            <input
              id="doc-guide"
              type="text"
              value={guideName}
              onChange={(e) => setGuideName(e.target.value)}
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
          </div>
        </div>
      </section>

      {apiError && (
        <AiErrorBanner
          message={apiError}
          onRetry={() => void handleGenerate(false)}
          onUseDemo={() => void handleGenerate(true)}
        />
      )}

      {isLoading && (
        <div className="rounded-xl border border-[#123447] bg-[#071824] p-8 space-y-3">
          <div className="flex items-center gap-3 text-sm font-medium text-[#1EE0FF]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Drafting 12-section academic engineering report for {activeProject.title}...
          </div>
          <div className="h-48 rounded-lg bg-[#040E16] animate-pulse border border-[#123447]" />
        </div>
      )}

      {!isLoading && !doc && (
        <div className="rounded-xl border border-[#123447] bg-[#071824] p-10 text-center space-y-4">
          <FileText className="w-9 h-9 text-[#09D5FC] mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-display text-base font-semibold text-white">
              Ready to Compile Project Report
            </h3>
            <p className="text-xs text-[#7A9BB0] leading-relaxed">
              Generate a structured project report including Title Page, Abstract, Introduction, Existing vs. Proposed System, Architecture, Implementation, Results, Conclusion, and Future Scope.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void handleGenerate(false)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Generate Full Report
            </button>
            <button
              type="button"
              onClick={() => void handleGenerate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#1EE0FF] bg-[#09D5FC]/10 hover:bg-[#09D5FC]/18 border border-[#09D5FC]/35 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Report
            </button>
          </div>
        </div>
      )}

      {!isLoading && doc && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Table of Contents */}
          <aside className="lg:sticky lg:top-24 rounded-xl border border-[#123447] bg-[#071824] p-4 space-y-2">
            <div className="text-xs font-semibold text-[#B6C7D4] px-2 pb-1 border-b border-[#123447]">
              Report Sections
            </div>
            <nav className="space-y-0.5">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block px-2 py-1.5 text-xs text-[#8FAAB9] hover:text-white hover:bg-[#0B2232] rounded-md transition-colors"
                >
                  {sec.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Report Content */}
          <article className="lg:col-span-3 space-y-5">
            {/* Title Page */}
            <section
              id="sec-title"
              className="rounded-xl border border-[#123447] bg-gradient-to-br from-[#071D2B] to-[#040E16] p-8 space-y-6"
            >
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#1EE0FF]">
                  ENTUDIO ProjectForge AI · Technical Project Report
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {doc.titlePage.title}
                </h2>
                <p className="text-sm text-[#B6C7D4]">{doc.titlePage.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#123447] text-xs">
                <div>
                  <span className="text-[#6E8E9F]">Prepared By: </span>
                  <span className="text-white font-medium">{doc.titlePage.preparedBy}</span>
                </div>
                <div>
                  <span className="text-[#6E8E9F]">Institution: </span>
                  <span className="text-white font-medium">{doc.titlePage.institution}</span>
                </div>
                <div>
                  <span className="text-[#6E8E9F]">Project Guide: </span>
                  <span className="text-white font-medium">{doc.titlePage.guideName}</span>
                </div>
                <div>
                  <span className="text-[#6E8E9F]">Metadata: </span>
                  <span className="text-white font-medium">
                    {doc.titlePage.domain} · {doc.titlePage.language} · {doc.titlePage.duration} · {doc.titlePage.date}
                  </span>
                </div>
              </div>
            </section>

            <ReportSection id="sec-abstract" title="1. Abstract" body={doc.abstract} />
            <ReportSection id="sec-intro" title="2. Introduction" body={doc.introduction} />
            <ReportSection id="sec-problem" title="3. Problem Statement" body={doc.problemStatement} />

            <section id="sec-objectives" className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-3">
              <h3 className="font-display text-base font-semibold text-white">4. Objectives</h3>
              <ul className="space-y-2 text-sm text-[#B6C7D4]">
                {doc.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-xs text-[#09D5FC] mt-1 tabular-nums">
                      {idx + 1}.
                    </span>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </section>

            <ReportSection id="sec-existing" title="5. Existing System" body={doc.existingSystem} />
            <ReportSection id="sec-proposed" title="6. Proposed System" body={doc.proposedSystem} />
            <ReportSection id="sec-arch" title="7. System Architecture" body={doc.systemArchitecture} />
            <ReportSection id="sec-impl" title="8. Implementation" body={doc.implementation} />
            <ReportSection id="sec-results" title="9. Results" body={doc.results} />
            <ReportSection id="sec-conclusion" title="10. Conclusion" body={doc.conclusion} />
            <ReportSection id="sec-future" title="11. Future Scope" body={doc.futureScope} />
          </article>
        </div>
      )}
    </div>
  );
}

function ReportSection({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <section id={id} className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-2.5">
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <p className="text-sm text-[#B6C7D4] leading-relaxed whitespace-pre-line">{body}</p>
    </section>
  );
}
