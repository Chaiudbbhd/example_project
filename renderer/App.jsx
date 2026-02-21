import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import Sidebar from './Sidebar';
import Editor from './Editor';
import TodoList from './TodoList';
import { buildPageTree, flattenTree } from './PageManager';

const AUTO_SAVE_DELAY = 450;

export default function App() {
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  const [draftPage, setDraftPage] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [expansionMap, setExpansionMap] = useState({});
  const dragSource = useRef(null);

  useEffect(() => {
    const boot = async () => {
      const initialPages = await window.api.pages.list();
      setPages(initialPages);
      if (initialPages.length) {
        const selected = initialPages[0];
        setActivePageId(selected.id);
        setDraftPage(selected);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (!activePageId) return;
    window.api.tasks.list(activePageId).then(setTasks);
  }, [activePageId]);

  useEffect(() => {
    if (!draftPage?.id) return;
    const timeout = setTimeout(async () => {
      const updated = await window.api.pages.update(draftPage);
      setPages((prev) => prev.map((page) => (page.id === updated.id ? updated : page)));
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timeout);
  }, [draftPage]);

  const pageTree = useMemo(() => buildPageTree(pages), [pages]);

  const syncActivePage = (id) => {
    const page = pages.find((entry) => entry.id === id);
    setActivePageId(id);
    setDraftPage(page || null);
  };

  const handleCreatePage = async (parentId = null) => {
    const created = await window.api.pages.create({ title: 'Untitled Page', parentId });
    const next = await window.api.pages.list();
    setPages(next);
    setExpansionMap((prev) => ({ ...prev, [parentId]: true }));
    syncActivePage(created.id);
  };

  const handleDeletePage = async (id) => {
    await window.api.pages.delete(id);
    const next = await window.api.pages.list();
    setPages(next);
    if (activePageId === id) {
      const fallback = next[0] || null;
      setActivePageId(fallback?.id || null);
      setDraftPage(fallback);
    }
  };

  const handleDrop = async (targetId) => {
    if (!dragSource.current || dragSource.current === targetId) return;
    const sourceId = dragSource.current;

    const tree = buildPageTree(pages);
    const mutate = (nodes) => {
      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        if (node.id === sourceId) {
          return nodes.splice(index, 1)[0];
        }
        const nested = mutate(node.children);
        if (nested) return nested;
      }
      return null;
    };

    const detached = mutate(tree);
    const attachTo = (nodes) => {
      for (const node of nodes) {
        if (node.id === targetId) {
          node.children.push(detached);
          return true;
        }
        if (attachTo(node.children)) return true;
      }
      return false;
    };

    if (!detached || !attachTo(tree)) return;

    const updates = flattenTree(tree);
    const reordered = await window.api.pages.reorder(updates);
    setPages(reordered);
    dragSource.current = null;
  };

  const handleUpdateTask = async (id, patch) => {
    await window.api.tasks.update({ id, ...patch });
    setTasks(await window.api.tasks.list(activePageId));
  };

  const activeTitle = draftPage?.title || 'LPK Notion Manager';

  return (
    <div className="flex h-screen bg-base text-textMain">
      <Sidebar
        tree={pageTree}
        activePageId={activePageId}
        expansionMap={expansionMap}
        onToggleExpand={(id) => setExpansionMap((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }))}
        onSelectPage={syncActivePage}
        onCreatePage={handleCreatePage}
        onCreateChild={handleCreatePage}
        onDeletePage={handleDeletePage}
        onDragStart={(id) => {
          dragSource.current = id;
        }}
        onDragOver={() => {}}
        onDrop={handleDrop}
      />

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-panel px-6 py-3">
          <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-textMuted">{activeTitle}</h2>
          <button type="button" className="rounded-md border border-border p-2 text-textMuted hover:text-textMain">
            <Settings size={16} />
          </button>
        </header>

        <div className="grid flex-1 grid-cols-12 gap-4 p-4">
          <section className="col-span-8 h-full rounded-lg border border-border bg-panel p-5 shadow-sm shadow-black/20 transition-all duration-200">
            <Editor page={draftPage} onChange={setDraftPage} />
          </section>
          <section className="col-span-4 h-full transition-all duration-200">
            <TodoList
              tasks={tasks}
              onAddTask={async (text) => {
                if (!activePageId) return;
                await window.api.tasks.create({ pageId: activePageId, text });
                setTasks(await window.api.tasks.list(activePageId));
              }}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={async (id) => {
                await window.api.tasks.delete(id);
                setTasks(await window.api.tasks.list(activePageId));
              }}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
