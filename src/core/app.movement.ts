import { AppState, Item } from "./app";

export const moveItemRight = (app: AppState, item: Item) => {
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

export const moveItemLeft = (app: AppState, item: Item) => {
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

export const moveItemUp = (app: AppState, item: Item) => {
  const parent = item.parent;
  if (parent && canItemBeMoved(app, item)) {
    const index = parent.children.indexOf(item);
    if (index > 0) {
      removeChildAt(parent, index);
      addChildAt(parent, item, index - 1);
    }
  }
};

export const moveItemDown = (app: AppState, item: Item) => {
  const parent = item.parent;
  if (parent && canItemBeMoved(app, item)) {
    const index = parent.children.indexOf(item);
    if (index <= parent.children.length - 1) {
      removeChildAt(parent, index);
      addChildAt(parent, item, index + 1);
    }
  }
};

const canItemBeMoved = (app: AppState, item: Item) => !isFocused(app, item);

const canItemBeMovedLeft = (app: AppState, item: Item) =>
  canItemBeMoved(app, item) && !!item.parent;

const isFocused = (app: AppState, item: Item) => app.itemFocused === item;

//common
const updateIsOpenFlag = (item: Item) => {
  item.isOpen = item.children.length !== 0;
};

const removeChildAt = (item: Item, index: number) => {
  item.children.splice(index, 1);
  updateIsOpenFlag(item);
};

export const removeChild = (parent: Item, item: Item) => {
  parent.children = parent.children.filter((c) => c !== item);
  updateIsOpenFlag(parent);
};

export const addChildAt = (parent: Item, item: Item, index: number) => {
  parent.children.splice(index, 0, item);
  item.parent = parent;
  updateIsOpenFlag(parent);
};

export const isRoot = (item: Item) => !item.parent;

export const hasChildren = (item: Item) => item.children.length > 0;
