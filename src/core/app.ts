import { showInput } from "../ui/input";
import { syncViews } from "./app.layout";
import {
  addChildAt,
  hasChildren,
  isRoot,
  moveItemDown,
  moveItemLeft,
  moveItemRight,
  moveItemUp,
  removeChild,
} from "./app.movement";

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

  x: number;
  y: number;
  fontSize: number;
  textColor: string;
  circleColor: string;
};

export type AppState = {
  root: Item;
  views: Map<Item, ItemView>;
  selectedItem: Item | undefined;
  itemFocused: Item;
};

export const item = (title: string, children: Item[] = []): Item =>
  mapPartialItem({ title, children });

export const closedItem = (title: string, children: Item[] = []): Item =>
  mapPartialItem({ title, children, isOpen: false });

export const mapPartialItem = (item: Partial<Item> | string): Item => {
  if (typeof item === "string")
    return { title: item, isOpen: false, children: [] };
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

  const selectedItem = root.children[0];

  const app = { root, views: new Map(), selectedItem, itemFocused: root };

  syncViews(app);
  return app;
};

export const focusOnItemSelected = (app: AppState) => {
  focusOnItem(app, app.selectedItem);
};

export const focusOnParentOfFocused = (app: AppState) => {
  const { itemFocused } = app;
  if (itemFocused && !isRoot(itemFocused) && itemFocused.parent) {
    focusOnItem(app, app.itemFocused?.parent);
  }
};

const focusOnItem = (app: AppState, item: Item | undefined) => {
  if (item) {
    app.itemFocused = item;
    app.views.clear();
  }
};

//Actions

export const moveDown = (app: AppState) =>
  app.selectedItem && changeSelection(app, getItemBelow(app, app.selectedItem));

export const moveUp = (app: AppState) =>
  app.selectedItem && changeSelection(app, getItemAbove(app.selectedItem));

export const moveLeft = (app: AppState) => {
  if (app.selectedItem) {
    if (app.selectedItem.isOpen && app.selectedItem !== app.itemFocused) {
      app.selectedItem.isOpen = false;
      forEachChild(app.selectedItem, (item) => {
        app.views.delete(item);
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
    }
  }
};

export const changeSelection = (app: AppState, item: Item | undefined) => {
  if (!item || !isOneOfTheParents(item, app.itemFocused)) return;

  app.selectedItem = item;
};

export const createItemNearSelected = (
  app: AppState,
  position: "before" | "after" | "inside"
) => {
  const context = app.selectedItem?.parent?.children;
  if (context && app.selectedItem) {
    const newItem = mapPartialItem("");

    if (position === "inside") {
      addChildAt(app.selectedItem, newItem, 0);
    } else {
      const index = context.indexOf(app.selectedItem);

      const targetIndex = index + (position === "after" ? 1 : 0);
      if (app.selectedItem.parent)
        addChildAt(app.selectedItem.parent, newItem, targetIndex);
    }
    changeSelection(app, newItem);

    showInput(app, "start");
  }
};

export const removeSelected = (app: AppState) => {
  const { selectedItem } = app;
  if (selectedItem && selectedItem.parent) {
    const nextItemToSelect =
      getItemAbove(selectedItem) || getFollowingItem(selectedItem);

    forEachChild(selectedItem, (item) => {
      app.views.delete(item);
    });
    app.views.delete(selectedItem);
    removeChild(selectedItem.parent, selectedItem);

    changeSelection(app, nextItemToSelect);
  }
};

type MovingDirection = "up" | "down" | "left" | "right";
const handlers: Record<MovingDirection, typeof moveItemLeft> = {
  down: moveItemDown,
  up: moveItemUp,
  left: moveItemLeft,
  right: moveItemRight,
};

export const moveSelectedItem = (
  app: AppState,
  movingDirection: MovingDirection
) => {
  const { selectedItem } = app;

  if (selectedItem) {
    handlers[movingDirection](app, selectedItem);
  }
};

// MOVEMENT
const getItemBelow = (app: AppState, item: Item): Item | undefined =>
  (item.isOpen && item.children.length > 0) || app.itemFocused == item
    ? item.children[0]
    : getFollowingItem(item);

const getFollowingItem = (item: Item): Item | undefined => {
  const followingItem = getFollowingSibling(item);
  if (followingItem) return followingItem;
  else {
    let parent = item.parent;
    while (parent && isLast(parent)) {
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
    const index = parent.children.indexOf(item);
    if (index > 0) {
      const previousItem = parent.children[index - 1];
      if (previousItem.isOpen)
        return getLastNestedItem(
          previousItem.children[previousItem.children.length - 1]
        );
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

const isOneOfTheParents = (item: Item, parent: Item) => {
  let current: Item | undefined = item;
  while (current) {
    if (current === parent) return true;
    current = current.parent;
  }
  return false;
};
