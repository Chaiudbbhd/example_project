# LPK Notion Manager

A Notion-like productivity manager for macOS built with Electron, React, TailwindCSS, and SQLite.

## Features

- Sidebar workspace navigation with nested pages
- Create, edit, delete, and reorganize pages via drag-and-drop
- Rich text-style editor using a fast autosaving writing surface
- Weekly to-do list tied to each page
- Persistent offline storage via local SQLite database
- Dark mode by default with smooth UI transitions
- Electron desktop app with `.dmg` export support

## Project Structure

```
LPK-Notion-Manager/
 ├── main.js
 ├── preload.js
 ├── package.json
 ├── electron-builder.json
 ├── /renderer
 │    ├── App.jsx
 │    ├── Sidebar.jsx
 │    ├── Editor.jsx
 │    ├── TodoList.jsx
 │    ├── PageManager.jsx
 │    └── index.jsx
 ├── /database
 │    └── db.js
 └── /styles
      └── global.css
```

## Installation

```bash
npm install
```

## Run in development

```bash
npm start
```

## Build renderer bundle

```bash
npm run build
```

## Build macOS app and DMG

```bash
npm run dist
```

The generated installer will be in `dist-electron/`.
