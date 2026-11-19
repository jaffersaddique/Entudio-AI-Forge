import { jsPDF } from 'jspdf';
import type { ProjectDocumentation, ProjectPlan } from '../types';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

export function downloadFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function slugifyFilename(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'project'
  );
}

export function formatProjectPlanMarkdown(
  meta: { title: string; domain: string; difficulty: string; language: string; duration: string },
  plan: ProjectPlan
): string {
  const lines: string[] = [
    `# ${meta.title}`,
    `**Domain:** ${meta.domain} | **Difficulty:** ${meta.difficulty} | **Language:** ${meta.language} | **Duration:** ${meta.duration}`,
    '',
    '## 1. Project Abstract',
    plan.abstract,
    '',
    '## 2. Problem Statement',
    plan.problemStatement,
    '',
    '## 3. Objectives',
    ...plan.objectives.map((o) => `- ${o}`),
    '',
    '## 4. Proposed Solution',
    plan.proposedSolution,
    '',
    '## 5. Technology Stack',
    ...plan.technologyStack.map((cat) => `- **${cat.category}:** ${cat.tools.join(', ')}`),
    '',
    '## 6. Software Requirements',
    ...plan.softwareRequirements.map((r) => `- ${r}`),
    '',
    '## 7. Hardware Requirements',
    ...plan.hardwareRequirements.map((r) => `- ${r}`),
    '',
    '## 8. System Modules',
    ...plan.systemModules.flatMap((m) => [
      `### ${m.name}`,
      m.description,
      ...m.responsibilities.map((resp) => `- ${resp}`),
      '',
    ]),
    '## 9. Development Roadmap',
    ...plan.roadmap.flatMap((p) => [
      `### ${p.phase}: ${p.title} (${p.duration})`,
      ...p.tasks.map((t) => `- [ ] ${t}`),
      '',
    ]),
    '## 10. Testing Procedures',
    ...plan.testingProcedures.map((t) => `- ${t}`),
    '',
    '## 11. Expected Results',
    ...plan.expectedResults.map((r) => `- ${r}`),
    '',
    `## 12. Starter Code (${plan.sampleCodeSnippet.filename})`,
    '```' + plan.sampleCodeSnippet.language,
    plan.sampleCodeSnippet.code,
    '```',
  ];
  return lines.join('\n');
}

export function formatDocumentationMarkdown(doc: ProjectDocumentation): string {
  const tp = doc.titlePage;
  return [
    `# ${tp.title}`,
    `### ${tp.subtitle}`,
    '',
    `- **Domain:** ${tp.domain}`,
    `- **Difficulty:** ${tp.difficulty}`,
    `- **Primary Language:** ${tp.language}`,
    `- **Duration:** ${tp.duration}`,
    `- **Prepared By:** ${tp.preparedBy}`,
    `- **Institution:** ${tp.institution}`,
    `- **Project Guide:** ${tp.guideName}`,
    `- **Date:** ${tp.date}`,
    '',
    '---',
    '',
    '## 1. Abstract',
    doc.abstract,
    '',
    '## 2. Introduction',
    doc.introduction,
    '',
    '## 3. Problem Statement',
    doc.problemStatement,
    '',
    '## 4. Objectives',
    ...doc.objectives.map((obj, idx) => `${idx + 1}. ${obj}`),
    '',
    '## 5. Existing System',
    doc.existingSystem,
    '',
    '## 6. Proposed System',
    doc.proposedSystem,
    '',
    '## 7. System Architecture',
    doc.systemArchitecture,
    '',
    '## 8. Implementation',
    doc.implementation,
    '',
    '## 9. Results',
    doc.results,
    '',
    '## 10. Conclusion',
    doc.conclusion,
    '',
    '## 11. Future Scope',
    doc.futureScope,
  ].join('\n');
}

export function formatDocumentationText(doc: ProjectDocumentation): string {
  const tp = doc.titlePage;
  const divider = '='.repeat(72);
  return [
    divider,
    tp.title.toUpperCase(),
    tp.subtitle,
    divider,
    `Domain: ${tp.domain} | Difficulty: ${tp.difficulty} | Language: ${tp.language} | Duration: ${tp.duration}`,
    `Prepared By: ${tp.preparedBy}`,
    `Institution: ${tp.institution}`,
    `Project Guide: ${tp.guideName}`,
    `Date: ${tp.date}`,
    divider,
    '',
    '1. ABSTRACT',
    doc.abstract,
    '',
    '2. INTRODUCTION',
    doc.introduction,
    '',
    '3. PROBLEM STATEMENT',
    doc.problemStatement,
    '',
    '4. OBJECTIVES',
    ...doc.objectives.map((o, i) => `  ${i + 1}. ${o}`),
    '',
    '5. EXISTING SYSTEM',
    doc.existingSystem,
    '',
    '6. PROPOSED SYSTEM',
    doc.proposedSystem,
    '',
    '7. SYSTEM ARCHITECTURE',
    doc.systemArchitecture,
    '',
    '8. IMPLEMENTATION',
    doc.implementation,
    '',
    '9. RESULTS',
    doc.results,
    '',
    '10. CONCLUSION',
    doc.conclusion,
    '',
    '11. FUTURE SCOPE',
    doc.futureScope,
  ].join('\n');
}

export function exportDocumentationPdf(doc: ProjectDocumentation): void {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 54;
  const maxWidth = pageWidth - margin * 2;

  const tp = doc.titlePage;

  // Title Page
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, 140, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('ENTUDIO PROJECTFORGE AI — ENGINEERING REPORT', margin, 56);

  pdf.setFontSize(22);
  const titleLines = pdf.splitTextToSize(tp.title, maxWidth);
  pdf.text(titleLines, margin, 94);

  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(13);
  const subLines = pdf.splitTextToSize(tp.subtitle, maxWidth);
  pdf.text(subLines, margin, 185);

  pdf.setDrawColor(203, 213, 225);
  pdf.line(margin, 230, pageWidth - margin, 230);

  const metaRows = [
    ['Engineering Domain', tp.domain],
    ['Difficulty Level', tp.difficulty],
    ['Primary Language', tp.language],
    ['Project Duration', tp.duration],
    ['Prepared By', tp.preparedBy],
    ['Institution', tp.institution],
    ['Project Guide', tp.guideName],
    ['Date', tp.date],
  ];

  let y = 265;
  metaRows.forEach(([label, val]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(label, margin, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    pdf.text(String(val || '—'), margin + 150, y);
    y += 26;
  });

  // Body Sections
  pdf.addPage();
  y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  const addSection = (heading: string, body: string | string[]) => {
    ensureSpace(48);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(37, 99, 235);
    pdf.text(heading, margin, y);
    y += 18;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(30, 41, 59);

    const paragraphs = Array.isArray(body)
      ? body.map((item, idx) => `${idx + 1}. ${item}`)
      : body.split('\n').filter((p) => p.trim().length > 0);

    paragraphs.forEach((para) => {
      const wrapped = pdf.splitTextToSize(para, maxWidth);
      wrapped.forEach((line: string) => {
        ensureSpace(16);
        pdf.text(line, margin, y);
        y += 15;
      });
      y += 6;
    });
    y += 10;
  };

  addSection('1. Abstract', doc.abstract);
  addSection('2. Introduction', doc.introduction);
  addSection('3. Problem Statement', doc.problemStatement);
  addSection('4. Objectives', doc.objectives);
  addSection('5. Existing System', doc.existingSystem);
  addSection('6. Proposed System', doc.proposedSystem);
  addSection('7. System Architecture', doc.systemArchitecture);
  addSection('8. Implementation', doc.implementation);
  addSection('9. Results', doc.results);
  addSection('10. Conclusion', doc.conclusion);
  addSection('11. Future Scope', doc.futureScope);

  // Add subtle page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`${tp.title} — Page ${i} of ${totalPages}`, margin, pageHeight - 24);
  }

  pdf.save(`${slugifyFilename(tp.title)}-report.pdf`);
}
