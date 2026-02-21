const path = require('path');
const { app } = require('electron');
const Database = require('better-sqlite3');

let db;

function initializeDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'lpk-notion-manager.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      parent_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(parent_id) REFERENCES pages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
  `);

  const pageCount = db.prepare('SELECT COUNT(*) as count FROM pages').get();
  if (!pageCount.count) {
    const insertPage = db.prepare(
      'INSERT INTO pages (title, content, parent_id, sort_order) VALUES (?, ?, NULL, 0)'
    );
    const info = insertPage.run(
      'Welcome to LPK Notion Manager',
      '# Welcome\n\nStart writing your first notes here.\n\n- Create nested pages\n- Track your weekly tasks\n- Everything saves automatically'
    );

    const insertTask = db.prepare('INSERT INTO tasks (page_id, text, completed) VALUES (?, ?, ?)');
    insertTask.run(info.lastInsertRowid, 'Plan weekly priorities', 0);
    insertTask.run(info.lastInsertRowid, 'Review completed work', 1);
  }
}

function getPages() {
  return db
    .prepare('SELECT id, title, content, parent_id as parentId, sort_order as sortOrder, updated_at as updatedAt FROM pages ORDER BY sort_order ASC, updated_at DESC')
    .all();
}

function getPageById(id) {
  return db
    .prepare('SELECT id, title, content, parent_id as parentId, sort_order as sortOrder, updated_at as updatedAt FROM pages WHERE id = ?')
    .get(id);
}

function createPage({ title = 'Untitled', parentId = null }) {
  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) as maxOrder FROM pages WHERE parent_id IS ?')
    .get(parentId);

  const stmt = db.prepare(
    'INSERT INTO pages (title, content, parent_id, sort_order, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
  );
  const result = stmt.run(title, '', parentId, maxOrder.maxOrder + 1);
  return getPageById(result.lastInsertRowid);
}

function updatePage({ id, title, content }) {
  db.prepare(
    'UPDATE pages SET title = COALESCE(?, title), content = COALESCE(?, content), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(title ?? null, content ?? null, id);
  return getPageById(id);
}

function deletePage(id) {
  db.prepare('DELETE FROM pages WHERE id = ?').run(id);
  return { success: true };
}

function reorderPages(updates) {
  const updateStmt = db.prepare('UPDATE pages SET parent_id = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  const transaction = db.transaction((rows) => {
    rows.forEach((row) => {
      updateStmt.run(row.parentId ?? null, row.sortOrder, row.id);
    });
  });
  transaction(updates);
  return getPages();
}

function getTasks(pageId) {
  return db
    .prepare('SELECT id, page_id as pageId, text, completed FROM tasks WHERE page_id = ? ORDER BY created_at ASC')
    .all(pageId)
    .map((task) => ({ ...task, completed: Boolean(task.completed) }));
}

function createTask({ pageId, text }) {
  const stmt = db.prepare('INSERT INTO tasks (page_id, text, completed, updated_at) VALUES (?, ?, 0, CURRENT_TIMESTAMP)');
  const result = stmt.run(pageId, text);
  return db
    .prepare('SELECT id, page_id as pageId, text, completed FROM tasks WHERE id = ?')
    .get(result.lastInsertRowid);
}

function updateTask({ id, text, completed }) {
  db.prepare(
    'UPDATE tasks SET text = COALESCE(?, text), completed = COALESCE(?, completed), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(text ?? null, typeof completed === 'boolean' ? Number(completed) : null, id);

  const updated = db.prepare('SELECT id, page_id as pageId, text, completed FROM tasks WHERE id = ?').get(id);
  return { ...updated, completed: Boolean(updated.completed) };
}

function deleteTask(id) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return { success: true };
}

module.exports = {
  initializeDatabase,
  getPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
