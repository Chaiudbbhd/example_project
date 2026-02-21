import React from 'react';
import { ChevronDown, ChevronRight, FilePlus2, Trash2 } from 'lucide-react';

function Node({ page, level, activePageId, expanded, onToggleExpand, onSelectPage, onCreateChild, onDelete, onDragStart, onDragOver, onDrop }) {
  const isActive = activePageId === page.id;
  const hasChildren = page.children.length > 0;

  return (
    <div>
      <div
        draggable
        onDragStart={() => onDragStart(page.id)}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(page.id);
        }}
        onDrop={() => onDrop(page.id)}
        className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition ${
          isActive ? 'bg-accent/20 text-textMain' : 'text-textMuted hover:bg-panelSoft hover:text-textMain'
        }`}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
      >
        <button
          type="button"
          aria-label={expanded ? 'Collapse' : 'Expand'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(page.id);
          }}
          className="h-4 w-4 text-textMuted"
        >
          {hasChildren ? expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} /> : null}
        </button>

        <button type="button" className="flex-1 truncate text-left" onClick={() => onSelectPage(page.id)}>
          {page.title}
        </button>

        <button
          type="button"
          className="hidden rounded p-1 text-textMuted hover:bg-base/70 hover:text-textMain group-hover:block"
          onClick={(e) => {
            e.stopPropagation();
            onCreateChild(page.id);
          }}
        >
          <FilePlus2 size={14} />
        </button>

        <button
          type="button"
          className="hidden rounded p-1 text-textMuted hover:bg-base/70 hover:text-red-400 group-hover:block"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(page.id);
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && hasChildren && (
        <div className="space-y-0.5">
          {page.children.map((child) => (
            <Node
              key={child.id}
              page={child}
              level={level + 1}
              activePageId={activePageId}
              expanded={expanded && child.uiExpanded}
              onToggleExpand={onToggleExpand}
              onSelectPage={onSelectPage}
              onCreateChild={onCreateChild}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ tree, activePageId, expansionMap, onToggleExpand, onSelectPage, onCreatePage, onCreateChild, onDeletePage, onDragStart, onDragOver, onDrop }) {
  const withExpansion = (nodes) =>
    nodes.map((node) => ({
      ...node,
      uiExpanded: expansionMap[node.id] ?? true,
      children: withExpansion(node.children)
    }));

  const normalizedTree = withExpansion(tree);

  return (
    <aside className="h-full w-80 border-r border-border bg-panel p-3">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-textMuted">Workspace</p>
          <h1 className="text-lg font-semibold text-textMain">LPK Notion Manager</h1>
        </div>
        <button
          type="button"
          onClick={() => onCreatePage(null)}
          className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white transition hover:brightness-110"
        >
          New Page
        </button>
      </div>

      <div className="max-h-[calc(100vh-120px)] space-y-0.5 overflow-y-auto pr-1">
        {normalizedTree.map((page) => (
          <Node
            key={page.id}
            page={page}
            level={0}
            activePageId={activePageId}
            expanded={page.uiExpanded}
            onToggleExpand={onToggleExpand}
            onSelectPage={onSelectPage}
            onCreateChild={onCreateChild}
            onDelete={onDeletePage}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
          />
        ))}
      </div>
    </aside>
  );
}
