import { ItemView } from "./app.layout";
import {
  removeChildAt,
  addChildAt,
  hasChildren,
  isRoot,
  removeChild,
  isFocused,
  getItemAbove,
  getItemBelow,
  isOneOfTheParents,
  getFollowingItem,
} from "./tree";

export type Item = {
  title: string;
  isOpen: boolean;
  children: Item[];

  view?: ItemView;
  parent?: Item;
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

const mapPartialItem = (item: Partial<Item> | string): Item => {
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
  }
};

export const moveDown = (app: AppState) =>
  app.selectedItem && changeSelection(app, getItemBelow(app, app.selectedItem));

export const moveUp = (app: AppState) =>
  app.selectedItem && changeSelection(app, getItemAbove(app.selectedItem));

export const moveLeft = (app: AppState) => {
  if (app.selectedItem) {
    if (app.selectedItem.isOpen && app.selectedItem !== app.itemFocused) {
      app.selectedItem.isOpen = false;
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
  }
};

export const removeSelected = (app: AppState) => {
  const { selectedItem } = app;
  if (selectedItem && selectedItem.parent) {
    const nextItemToSelect =
      getItemAbove(selectedItem) || getFollowingItem(selectedItem);

    removeChild(selectedItem.parent, selectedItem);

    changeSelection(app, nextItemToSelect);
  }
};

// MOVING ITEM ON A TREE
const moveItemRight = (app: AppState, item: Item) => {
  const parent = item.parent;
  if (parent && canItemBeMoved(app, item)) {
    const index = parent.children.indexOf(item);
    if (index > 0) {
      const prevItem = parent.children[index - 1];
      removeChildAt(parent, index);
      addChildAt(prevItem, item, prevItem.children.length);
    }
  }
};

const moveItemLeft = (app: AppState, item: Item) => {
  const parent = item.parent;
  if (parent && canItemBeMovedLeft(app, item)) {
    const parentOfParent = parent.parent;
    if (parentOfParent) {
      const parentIndex = parentOfParent.children.indexOf(parent);
      removeChild(parent, item);
      addChildAt(parentOfParent, item, parentIndex + 1);
    }
  }
};

const moveItemUp = (app: AppState, item: Item) => {
  const parent = item.parent;
  if (parent && canItemBeMoved(app, item)) {
    const index = parent.children.indexOf(item);
    if (index > 0) {
      removeChildAt(parent, index);
      addChildAt(parent, item, index - 1);
    }
  }
};

const moveItemDown = (app: AppState, item: Item) => {
  const parent = item.parent;
  if (parent && canItemBeMoved(app, item)) {
    const index = parent.children.indexOf(item);
    if (index <= parent.children.length - 1) {
      removeChildAt(parent, index);
      addChildAt(parent, item, index + 1);
    }
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

const canItemBeMoved = (app: AppState, item: Item) => !isFocused(app, item);

const canItemBeMovedLeft = (app: AppState, item: Item) =>
  canItemBeMoved(app, item) && !!item.parent;
