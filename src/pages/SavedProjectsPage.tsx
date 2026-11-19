import { useState } from 'react';
import {
  Copy,
  Edit3,
  FolderKanban,
  FolderOpen,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type {
  DifficultyLevel,
  EngineeringDomain,
  EngineeringProject,
  NavPage,
} from '../types';

interface SavedProjectsPageProps {
  projects: EngineeringProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onUpdateProject: (updated: EngineeringProject) => void;
  onDuplicateProject: (project: EngineeringProject) => void;
  onDeleteProject: (id: string) => void;
  onNavigate: (page: NavPage) => void;
}

const DOMAINS: Array<'All' | EngineeringDomain> = [
  'All',
  'AI/ML',
  'Web Development',
  'IoT',
  'Robotics',
  'VLSI',
  'Embedded Systems',
  'Data Science',
  'Other',
];

export function SavedProjectsPage({
  projects,
  activeProjectId,
  onSelectProject,
  onUpdateProject,
  onDuplicateProject,
  onDeleteProject,
  onNavigate,
}: SavedProjectsPageProps) {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<'All' | EngineeringDomain>('All');
  const [editingProject, setEditingProject] = useState<EngineeringProject | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDomain, setEditDomain] = useState<EngineeringDomain>('AI/ML');
  const [editDifficulty, setEditDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [editLanguage, setEditLanguage] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editAbstract, setEditAbstract] = useState('');

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.language.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domainFilter === 'All' || p.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const openEditModal = (proj: EngineeringProject) => {
    setEditingProject(proj);
    setEditTitle(proj.title);
    setEditDomain(proj.domain);
    setEditDifficulty(proj.difficulty);
    setEditLanguage(proj.language);
    setEditDuration(proj.duration);
    setEditAbstract(proj.plan.abstract);
  };

  const handleSaveEdit = () => {
    if (!editingProject || !editTitle.trim()) return;
    onUpdateProject({
      ...editingProject,
      title: editTitle.trim(),
      domain: editDomain,
      difficulty: editDifficulty,
      language: editLanguage.trim() || editingProject.language,
      duration: editDuration.trim() || editingProject.duration,
      updatedAt: new Date().toISOString(),
      plan: {
        ...editingProject.plan,
        abstract: editAbstract.trim() || editingProject.plan.abstract,
      },
    });
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Toolbar */}
      <section className="rounded-xl border border-[#123447] bg-[#071824] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5C7D91] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved projects by title or language..."
            className="w-full rounded-lg border border-[#153E54] bg-[#040E16] pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#567488] focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter by domain"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value as 'All' | EngineeringDomain)}
            className="rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-xs font-medium text-[#E2F0F7] focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 cursor-pointer"
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Domains' : d}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onNavigate('generator')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </section>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#123447] bg-[#071824] p-12 text-center space-y-3">
          <FolderKanban className="w-9 h-9 text-[#5E7E92] mx-auto" />
          <p className="text-sm font-medium text-white">No matching projects found</p>
          <p className="text-xs text-[#7A9BB0]">
            Adjust your search filter or generate a new engineering project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((proj) => {
            const done = proj.tasks.filter((t) => t.completed).length;
            const total = proj.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isActive = proj.id === activeProjectId;
            const isDeleting = confirmDeleteId === proj.id;

            return (
              <article
                key={proj.id}
                className={`rounded-xl border bg-[#071824] p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isActive ? 'border-[#09D5FC]/60' : 'border-[#123447] hover:border-[#1B4C66]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-display text-base font-bold text-white leading-snug">
                        {proj.title}
                      </h3>
                      <div className="text-xs text-[#7A9BB0]">
                        {proj.domain} · {proj.difficulty} · {proj.language} · {proj.duration}
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-xs font-semibold text-[#1EE0FF] shrink-0">Active</span>
                    )}
                  </div>

                  <p className="text-xs text-[#B6C7D4] leading-relaxed line-clamp-3">
                    {proj.plan.abstract}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#7A9BB0] tabular-nums">
                      <span>
                        Tracker: {done}/{total} tasks
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0E293A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#09D5FC]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#102E40] flex flex-wrap items-center justify-between gap-2">
                  {isDeleting ? (
                    <div className="w-full flex items-center justify-between gap-2 bg-rose-950/30 border border-rose-500/30 rounded-lg px-3 py-2">
                      <span className="text-xs text-rose-200">Delete this project?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 text-xs text-[#B6C7D4] hover:text-white bg-[#0B2232] rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProject(proj.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded cursor-pointer"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(proj.id);
                            onNavigate('tracker');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-md transition-colors cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(proj.id);
                            onNavigate('architecture');
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-md transition-colors cursor-pointer"
                        >
                          Architecture
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(proj.id);
                            onNavigate('documentation');
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-md transition-colors cursor-pointer"
                        >
                          Report
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(proj)}
                          aria-label={`Edit ${proj.title}`}
                          className="p-1.5 text-[#7A9BB0] hover:text-white hover:bg-[#0B2232] rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateProject(proj)}
                          aria-label={`Duplicate ${proj.title}`}
                          className="p-1.5 text-[#7A9BB0] hover:text-white hover:bg-[#0B2232] rounded-md transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(proj.id)}
                          aria-label={`Delete ${proj.title}`}
                          className="p-1.5 text-[#7A9BB0] hover:text-rose-400 hover:bg-[#0B2232] rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-xl border border-[#153E54] bg-[#071824] p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 id="edit-project-modal-title" className="font-display text-lg font-bold text-white">
                Edit Project Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                aria-label="Close modal"
                className="p-1.5 text-[#7A9BB0] hover:text-white rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label htmlFor="edit-title" className="text-xs font-medium text-[#B6C7D4]">
                  Project Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="edit-domain" className="text-xs font-medium text-[#B6C7D4]">
                    Domain
                  </label>
                  <select
                    id="edit-domain"
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value as EngineeringDomain)}
                    className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    {DOMAINS.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-diff" className="text-xs font-medium text-[#B6C7D4]">
                    Difficulty
                  </label>
                  <select
                    id="edit-diff"
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="edit-lang" className="text-xs font-medium text-[#B6C7D4]">
                    Primary Language
                  </label>
                  <input
                    id="edit-lang"
                    type="text"
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-dur" className="text-xs font-medium text-[#B6C7D4]">
                    Duration
                  </label>
                  <input
                    id="edit-dur"
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-abs" className="text-xs font-medium text-[#B6C7D4]">
                  Abstract
                </label>
                <textarea
                  id="edit-abs"
                  rows={4}
                  value={editAbstract}
                  onChange={(e) => setEditAbstract(e.target.value)}
                  className="w-full rounded-lg border border-[#153E54] bg-[#040E16] p-3 text-xs text-white leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
