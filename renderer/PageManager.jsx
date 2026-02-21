export function buildPageTree(pages) {
  const map = new Map();
  pages.forEach((page) => map.set(page.id, { ...page, children: [] }));

  const roots = [];
  map.forEach((page) => {
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId).children.push(page);
    } else {
      roots.push(page);
    }
  });

  const sortNodes = (nodes) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);
  return roots;
}

export function flattenTree(nodes, parentId = null, rows = []) {
  nodes.forEach((node, index) => {
    rows.push({ id: node.id, parentId, sortOrder: index });
    if (node.children.length) {
      flattenTree(node.children, node.id, rows);
    }
  });

  return rows;
}
