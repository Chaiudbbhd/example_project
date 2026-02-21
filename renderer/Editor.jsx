import React from 'react';

export default function Editor({ page, onChange }) {
  if (!page) {
    return <div className="flex h-full items-center justify-center text-textMuted">Select a page to start editing.</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <input
        type="text"
        value={page.title}
        onChange={(event) => onChange({ ...page, title: event.target.value })}
        className="mb-4 w-full border-b border-border bg-transparent pb-3 text-3xl font-semibold text-textMain outline-none placeholder:text-textMuted"
        placeholder="Untitled"
      />
      <textarea
        value={page.content || ''}
        onChange={(event) => onChange({ ...page, content: event.target.value })}
        className="h-full w-full resize-none rounded-lg border border-border bg-panel p-4 leading-7 text-textMain outline-none transition focus:border-accent"
        placeholder="Start writing your thoughts, meeting notes, and plans..."
      />
    </div>
  );
}
