import React, { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';

export default function TodoList({ tasks, onAddTask, onUpdateTask, onDeleteTask }) {
  const [draft, setDraft] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    onAddTask(value);
    setDraft('');
  };

  return (
    <section className="h-full rounded-lg border border-border bg-panel p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-textMuted">Weekly To-Do</h3>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="flex-1 rounded-md border border-border bg-base px-3 py-2 text-sm text-textMain outline-none focus:border-accent"
          placeholder="Add weekly task..."
        />
        <button type="submit" className="rounded-md bg-accent px-3 text-white hover:brightness-110">
          <Plus size={16} />
        </button>
      </form>

      <ul className="space-y-2 overflow-y-auto">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 rounded-md bg-base px-3 py-2 text-sm text-textMain">
            <button
              type="button"
              onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
              className={`flex h-5 w-5 items-center justify-center rounded border ${
                task.completed ? 'border-accent bg-accent text-white' : 'border-border text-transparent'
              }`}
            >
              <Check size={13} />
            </button>
            <span className={`flex-1 ${task.completed ? 'text-textMuted line-through' : ''}`}>{task.text}</span>
            <button type="button" onClick={() => onDeleteTask(task.id)} className="text-textMuted hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
