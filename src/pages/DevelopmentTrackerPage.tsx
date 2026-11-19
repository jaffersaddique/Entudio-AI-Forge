import { useState, type FormEvent } from 'react';
import {
  Check,
  CheckSquare,
  ListPlus,
  Plus,
  Save,
  Square,
  StickyNote,
  Trash2,
} from 'lucide-react';
import type { EngineeringProject, ProjectNote, TrackerTask } from '../types';
import { createTasksFromPlan } from '../data/sampleProjects';

interface DevelopmentTrackerPageProps {
  projects: EngineeringProject[];
  activeProject: EngineeringProject | undefined;
  onSelectProject: (id: string) => void;
  onUpdateProject: (updated: EngineeringProject) => void;
}

export function DevelopmentTrackerPage({
  projects,
  activeProject,
  onSelectProject,
  onUpdateProject,
}: DevelopmentTrackerPageProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPhase, setTaskPhase] = useState('Phase 1');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [noteInput, setNoteInput] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!activeProject) {
    return (
      <div className="rounded-xl border border-[#123447] bg-[#071824] p-10 text-center space-y-2">
        <CheckSquare className="w-8 h-8 text-[#5E7E92] mx-auto" />
        <p className="text-sm font-medium text-white">No project selected</p>
        <p className="text-xs text-[#7A9BB0]">
          Create or select a project to track milestones and engineering notes.
        </p>
      </div>
    );
  }

  const tasks = activeProject.tasks;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const commitTasks = (nextTasks: TrackerTask[]) => {
    onUpdateProject({
      ...activeProject,
      tasks: nextTasks,
      updatedAt: new Date().toISOString(),
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1400);
  };

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = taskTitle.trim();
    if (!trimmed) return;

    const newTask: TrackerTask = {
      id: `task-${Date.now()}`,
      title: trimmed,
      phase: taskPhase.trim() || 'General',
      priority: taskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    commitTasks([newTask, ...tasks]);
    setTaskTitle('');
  };

  const handleToggleTask = (id: string) => {
    commitTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    commitTasks(tasks.filter((t) => t.id !== id));
  };

  const handleImportRoadmap = () => {
    const roadmapTasks = createTasksFromPlan(activeProject.plan);
    const existingTitles = new Set(tasks.map((t) => t.title.toLowerCase()));
    const fresh = roadmapTasks.filter((rt) => !existingTitles.has(rt.title.toLowerCase()));
    if (fresh.length === 0) return;
    commitTasks([...tasks, ...fresh]);
  };

  const handleAddNote = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = noteInput.trim();
    if (!trimmed) return;
    const newNote: ProjectNote = {
      id: `note-${Date.now()}`,
      content: trimmed,
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject({
      ...activeProject,
      notes: [newNote, ...activeProject.notes],
      updatedAt: new Date().toISOString(),
    });
    setNoteInput('');
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1400);
  };

  const handleDeleteNote = (id: string) => {
    onUpdateProject({
      ...activeProject,
      notes: activeProject.notes.filter((n) => n.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Project Selector & Progress Summary */}
      <section className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="tracker-project-select" className="text-xs font-medium text-[#7A9BB0]">
              Tracking Project:
            </label>
            <select
              id="tracker-project-select"
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

          <div className="flex items-center gap-3">
            {savedFeedback && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <Save className="w-3.5 h-3.5" />
                Saved to LocalStorage
              </span>
            )}
            <button
              type="button"
              onClick={handleImportRoadmap}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1EE0FF] bg-[#09D5FC]/10 hover:bg-[#09D5FC]/18 border border-[#09D5FC]/35 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ListPlus className="w-3.5 h-3.5 text-[#09D5FC]" />
              Import Roadmap Tasks
            </button>
          </div>
        </div>

        {/* Progress Bar & Tabular Metrics */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[#B6C7D4] font-medium">
              Completion Progress ·{' '}
              <span className="font-mono tabular-nums text-white">{completedCount}</span> completed,{' '}
              <span className="font-mono tabular-nums text-amber-300">{pendingCount}</span> pending
            </span>
            <span className="font-display text-lg font-bold text-[#09D5FC] tabular-nums">
              {percentage}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#0E293A] overflow-hidden">
            <div
              className="h-full bg-[#09D5FC] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tasks Column */}
        <section className="xl:col-span-2 rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-base font-semibold text-white">
              Development Checklist
            </h3>

            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#040E16] border border-[#123447]">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                    filter === f ? 'bg-[#09D5FC] text-[#04121C]' : 'text-[#8FAAB9] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Add a development task or milestone..."
              className="sm:col-span-6 rounded-lg border border-[#153E54] bg-[#040E16] px-3.5 py-2 text-sm text-white placeholder:text-[#567488] focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
            <input
              type="text"
              value={taskPhase}
              onChange={(e) => setTaskPhase(e.target.value)}
              placeholder="Phase"
              className="sm:col-span-2 rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as 'Low' | 'Medium' | 'High')}
              className="sm:col-span-2 rounded-lg border border-[#153E54] bg-[#040E16] px-2.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50 cursor-pointer"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button
              type="submit"
              className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </form>

          {/* Checklist */}
          {filteredTasks.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#7A9BB0] border border-dashed border-[#153E54] rounded-lg">
              {tasks.length === 0
                ? 'No tasks added yet. Add a task above or click "Import Roadmap Tasks".'
                : `No ${filter} tasks found.`}
            </div>
          ) : (
            <ul className="divide-y divide-[#102B3B]">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className="py-3 flex items-start justify-between gap-3 group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className="flex items-start gap-3 text-left flex-1 min-w-0 cursor-pointer"
                  >
                    {task.completed ? (
                      <span className="mt-0.5 w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <Square className="w-4 h-4 text-[#5C7D91] group-hover:text-[#09D5FC] mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div
                        className={`text-sm ${
                          task.completed ? 'line-through text-[#5E7E92]' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="mt-0.5 text-xs text-[#6E8E9F]">
                        <span>{task.phase}</span>
                        <span aria-hidden="true"> · </span>
                        <span
                          className={
                            task.priority === 'High'
                              ? 'text-amber-400'
                              : task.priority === 'Medium'
                              ? 'text-[#1EE0FF]'
                              : 'text-[#8FAAB9]'
                          }
                        >
                          {task.priority} priority
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    aria-label={`Delete task ${task.title}`}
                    className="p-1.5 text-[#5C7D91] hover:text-rose-400 rounded-md transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Engineering Notes Column */}
        <section className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-[#09D5FC]" />
            <h3 className="font-display text-base font-semibold text-white">Engineering Notes</h3>
          </div>

          <form onSubmit={handleAddNote} className="space-y-2.5">
            <textarea
              rows={4}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Record calibration results, bug observations, or next-step reminders..."
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] p-3 text-xs text-white placeholder:text-[#567488] focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#1EE0FF] bg-[#09D5FC]/12 hover:bg-[#09D5FC]/22 border border-[#09D5FC]/35 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Note
            </button>
          </form>

          <div className="space-y-3 pt-2">
            {activeProject.notes.length === 0 ? (
              <p className="text-xs text-[#6E8E9F]">No notes saved for this project yet.</p>
            ) : (
              activeProject.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-[#123447] bg-[#040E16] p-3.5 space-y-2"
                >
                  <p className="text-xs text-[#B6C7D4] leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#6E8E9F] font-mono">
                    <span>
                      {new Date(note.updatedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-[#6E8E9F] hover:text-rose-400 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
