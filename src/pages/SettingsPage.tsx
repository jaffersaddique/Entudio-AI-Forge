import { useEffect, useState, type ChangeEvent } from 'react';
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import type {
  DifficultyLevel,
  EngineeringDomain,
  EngineeringProject,
  WorkspaceSettings,
} from '../types';
import { checkAiStatus } from '../services/aiService';
import { downloadFile } from '../utils/exportUtils';

interface SettingsPageProps {
  settings: WorkspaceSettings;
  projects: EngineeringProject[];
  onSaveSettings: (next: WorkspaceSettings) => void;
  onRestoreSamples: () => void;
  onClearAll: () => void;
  onImportProjects: (imported: EngineeringProject[]) => void;
}

const DOMAINS: EngineeringDomain[] = [
  'AI/ML',
  'Web Development',
  'IoT',
  'Robotics',
  'VLSI',
  'Embedded Systems',
  'Data Science',
  'Other',
];

export function SettingsPage({
  settings,
  projects,
  onSaveSettings,
  onRestoreSamples,
  onClearAll,
  onImportProjects,
}: SettingsPageProps) {
  const [form, setForm] = useState<WorkspaceSettings>(settings);
  const [savedToast, setSavedToast] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [aiHealth, setAiHealth] = useState<{ checked: boolean; aiConfigured: boolean; model: string }>({
    checked: false,
    aiConfigured: false,
    model: 'gemini-4-hydrogen',
  });

  useEffect(() => {
    let active = true;
    checkAiStatus().then((status) => {
      if (active) {
        setAiHealth({
          checked: true,
          aiConfigured: status.aiConfigured,
          model: status.model,
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = () => {
    onSaveSettings(form);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  const handleExportWorkspace = () => {
    downloadFile(
      `entudio-projectforge-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ projects, settings: form }, null, 2),
      'application/json'
    );
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed.projects;
      if (!Array.isArray(list)) {
        setImportMessage('Invalid backup format: expected a JSON array of projects.');
        return;
      }
      onImportProjects(list as EngineeringProject[]);
      setImportMessage(`Imported ${list.length} project(s) into your workspace.`);
    } catch {
      setImportMessage('Could not parse the selected JSON file.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* AI Connection & Demo Mode */}
      <section className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-base font-semibold text-white">
            AI Generation Runtime &amp; Demo Mode
          </h2>
          <p className="text-xs text-[#7A9BB0]">
            Gemini API calls execute securely on the server using the environment key configured in AI Studio Secrets.
          </p>
        </div>

        <div className="rounded-lg border border-[#123447] bg-[#040E16] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {aiHealth.checked ? (
              aiHealth.aiConfigured ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-400 shrink-0" />
              )
            ) : (
              <Sparkles className="w-5 h-5 text-[#09D5FC] shrink-0" />
            )}
            <div>
              <div className="text-sm font-medium text-white">
                {!aiHealth.checked
                  ? 'Checking server Gemini configuration...'
                  : aiHealth.aiConfigured
                  ? `Server Gemini API Ready (${aiHealth.model})`
                  : 'Server GEMINI_API_KEY Not Configured'}
              </div>
              <div className="text-xs text-[#7A9BB0]">
                {aiHealth.aiConfigured
                  ? 'Live AI project planning, architecture synthesis, code assistance, and reports are enabled.'
                  : 'Add GEMINI_API_KEY in AI Studio Secrets or enable Demo Mode below to explore sample outputs.'}
              </div>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 text-xs font-medium text-[#E2F0F7] cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={form.demoModeEnabled}
              onChange={(e) => {
                const updated = { ...form, demoModeEnabled: e.target.checked };
                setForm(updated);
                onSaveSettings(updated);
              }}
              className="w-4 h-4 rounded border-[#1B4C66] bg-[#040E16] accent-[#09D5FC]"
            />
            Force Demo Mode (Sample Outputs)
          </label>
        </div>
      </section>

      {/* Profile & Report Defaults */}
      <section className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-5">
        <h2 className="font-display text-base font-semibold text-white">
          Student / Engineer Profile &amp; Defaults
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="set-name" className="block text-xs font-medium text-[#B6C7D4]">
              Full Name / Team Name
            </label>
            <input
              id="set-name"
              type="text"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="set-guide" className="block text-xs font-medium text-[#B6C7D4]">
              Default Faculty Mentor / Guide
            </label>
            <input
              id="set-guide"
              type="text"
              value={form.guideName}
              onChange={(e) => setForm({ ...form, guideName: e.target.value })}
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="set-inst" className="block text-xs font-medium text-[#B6C7D4]">
              Department / Institution
            </label>
            <input
              id="set-inst"
              type="text"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#09D5FC]/50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="set-domain" className="block text-xs font-medium text-[#B6C7D4]">
              Default Engineering Domain
            </label>
            <select
              id="set-domain"
              value={form.defaultDomain}
              onChange={(e) =>
                setForm({ ...form, defaultDomain: e.target.value as EngineeringDomain })
              }
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-sm text-white cursor-pointer"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="set-diff" className="block text-xs font-medium text-[#B6C7D4]">
              Default Difficulty
            </label>
            <select
              id="set-diff"
              value={form.defaultDifficulty}
              onChange={(e) =>
                setForm({ ...form, defaultDifficulty: e.target.value as DifficultyLevel })
              }
              className="w-full rounded-lg border border-[#153E54] bg-[#040E16] px-3 py-2 text-sm text-white cursor-pointer"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-emerald-400">
            {savedToast ? 'Settings saved to LocalStorage.' : ''}
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#04121C] bg-[#09D5FC] hover:bg-[#32E0FF] rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </section>

      {/* LocalStorage Workspace Data Management */}
      <section className="rounded-xl border border-[#123447] bg-[#071824] p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-base font-semibold text-white">
            Workspace Storage &amp; Backups
          </h2>
          <p className="text-xs text-[#7A9BB0]">
            All saved projects, architectures, tasks, notes, and reports are stored locally in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportWorkspace}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Workspace JSON
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#B6C7D4] hover:text-white bg-[#0B2232] hover:bg-[#103046] rounded-lg transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Import Backup JSON
            <input
              type="file"
              accept="application/json"
              onChange={(e) => void handleImportFile(e)}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              onRestoreSamples();
              setImportMessage('Restored default sample engineering projects.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1EE0FF] bg-[#09D5FC]/10 hover:bg-[#09D5FC]/18 border border-[#09D5FC]/35 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Sample Projects
          </button>

          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Projects
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-rose-950/40 border border-rose-500/40 rounded-lg px-3 py-1.5">
              <span className="text-xs text-rose-200">Erase all local projects?</span>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="text-xs text-[#B6C7D4] hover:text-white px-2 py-0.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                  setImportMessage('All saved projects cleared.');
                }}
                className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 px-2.5 py-1 rounded cursor-pointer"
              >
                Confirm
              </button>
            </div>
          )}
        </div>

        {importMessage && (
          <p className="text-xs text-[#1EE0FF] pt-1">{importMessage}</p>
        )}
      </section>
    </div>
  );
}
