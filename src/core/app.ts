export type Item = {
  title: string;
  isOpen: boolean;
  children: Item[];
  view?: ItemView;

  parent?: Item;
};

export type ItemView = {
  gridX: number;
  gridY: number;
  item: Item;
  isSelected: boolean;
};

export type AppState = {
  root: Item;
  views: Map<Item, ItemView>;
  selectedItem: Item | undefined;
};

export const mapPartialItem = (item: Partial<Item> | string): Item => {
  if (typeof item === "string")
    return {
      title: item,
      isOpen: false,
      children: [],
    };
  else {
    const children = item.children ? item.children.map(mapPartialItem) : [];
    const res: Item = {
      title: "",
      isOpen: children.length > 0,
      ...item,
      children,
    };
    res.children.forEach((c) => (c.parent = res));
    return res;
  }
};

export const createApp = (items: Item[]): AppState => {
  const root: Item = mapPartialItem({ title: "Root", children: items });
  const views: Map<Item, ItemView> = new Map();

  const selectedItem = root.children[0];

  layoutRoot(root, (item, gridX, gridY) => {
    views.set(item, createView(item, gridX, gridY, item === selectedItem));
  });

  return { root, views, selectedItem };
};

type LayoutCallback = (item: Item, gridX: number, gridY: number) => void;

export const layoutRoot = (root: Item, cb: LayoutCallback) =>
  traverseItems(root.children, 0, 0, cb);

const traverseItems = (
  items: Item[],
  gridX: number,
  gridY: number,
  fn: LayoutCallback
): number =>
  items.reduce((totalGridHeight, child) => {
    const currentGridY = gridY + totalGridHeight;
    fn(child, gridX, currentGridY);

    return (
      totalGridHeight +
      1 +
      (hasVisibleChildren(child)
        ? traverseItems(child.children, gridX + 1, currentGridY + 1, fn)
        : 0)
    );
  }, 0);

const hasVisibleChildren = (item: Item) =>
  item.isOpen && item.children.length > 0;

//Actions

export const moveDown = (app: AppState) =>
  app.selectedItem && changeSelection(app, getItemBelow(app.selectedItem));

export const moveUp = (app: AppState) =>
  app.selectedItem && changeSelection(app, getItemAbove(app.selectedItem));

export const moveLeft = (app: AppState) => {
  if (app.selectedItem) {
    if (app.selectedItem.isOpen) {
      app.selectedItem.isOpen = false;
      forEachChild(app.selectedItem, (item) => {
        app.views.delete(item);
      });
      layoutRoot(app.root, (item, gridX, gridY) => {
        const view = app.views.get(item);
        if (view) {
          view.gridX = gridX;
          view.gridY = gridY;
        }
      });
    } else if (app.selectedItem.parent && !isRoot(app.selectedItem.parent))
      changeSelection(app, app.selectedItem.parent);
  }
};

export const moveRight = (app: AppState) => {
  if (app.selectedItem) {
    if (app.selectedItem.isOpen && hasChildren(app.selectedItem)) {
      changeSelection(app, app.selectedItem.children[0]);
    } else if (!app.selectedItem.isOpen) {
      app.selectedItem.isOpen = true;
      layoutRoot(app.root, (item, gridX, gridY) => {
        const view = app.views.get(item);
        if (view) {
          view.gridX = gridX;
          view.gridY = gridY;
        } else {
          app.views.set(
            item,
            createView(item, gridX, gridY, item === app.selectedItem)
          );
        }
      });
    }
  }
};

export const changeSelection = (app: AppState, item: Item | undefined) => {
  if (!item) return;
  const currentView = app.selectedItem?.view;
  if (currentView) currentView.isSelected = false;
  if (item.view) {
    item.view.isSelected = true;
    app.selectedItem = item;
  }
};

const createView = (
  item: Item,
  gridX: number,
  gridY: number,
  isSelected: boolean
): ItemView => {
  const view: ItemView = { gridX, gridY, item, isSelected };

  item.view = view;
  return view;
};
// MOVEMENT

const getItemBelow = (item: Item): Item | undefined =>
  item.isOpen && item.children.length > 0
    ? item.children[0]
    : getFollowingItem(item);

const getFollowingItem = (item: Item): Item | undefined => {
  const followingItem = getFollowingSibling(item);
  if (followingItem && !isBoard(item.parent)) return followingItem;
  else {
    let parent = item.parent;
    while (parent && (isLast(parent) || isBoard(parent.parent))) {
      parent = parent.parent;
    }
    if (parent) return getFollowingSibling(parent);
  }
};

const getFollowingSibling = (item: Item): Item | undefined =>
  getRelativeSibling(item, (currentIndex) => currentIndex + 1);

const getRelativeSibling = (
  item: Item,
  getItemIndex: F2<number, number>
): Item | undefined => {
  const context = item.parent?.children;
  if (context) {
    const index = context.indexOf(item);
    return context[getItemIndex(index)];
  }
};

const getItemAbove = (item: Item): Item | undefined => {
  const parent = item.parent;
  if (parent) {
    if (isBoard(parent)) return parent;

    const index = parent.children.indexOf(item);
    if (index > 0) {
      const previousItem = parent.children[index - 1];
      if (isBoard(previousItem) && previousItem.isOpen)
        return getLastNestedItem(previousItem.children[0]);
      return getLastNestedItem(previousItem);
    } else if (!isRoot(parent)) return parent;
  }
};
const getLastNestedItem = (item: Item): Item => {
  if (item.isOpen && item.children) {
    const { children } = item;
    return getLastNestedItem(children[children.length - 1]);
  }
  return item;
};

const isBoard = (item: Item | undefined): boolean => false; //item?.view === "board";
const isRoot = (item: Item) => !item.parent;

const isLast = (item: Item): boolean => !getFollowingSibling(item);

export const forEachChild = (item: Item, cb: A2<Item, Item>) => {
  const traverse = (children: Item[]) => {
    children.forEach((c) => {
      cb(c, item);
      if (hasChildren(c)) forEachChild(c, cb);
    });
  };
  traverse(item.children);
};

export const hasChildren = (item: Item) => item.children.length > 0;

// canditates to extract

type A1<T1> = (a: T1) => void;
type A2<T1, T2> = (a: T1, b: T2) => void;
type A3<T1, T2, T3> = (a: T1, b: T2, c: T3) => void;

type F1<T1> = () => T1;
type F2<T1, T2> = (a: T1) => T2;
type F3<T1, T2, T3> = (a: T1, b: T2) => T3;

type Predicate<T> = F2<T, boolean>;
