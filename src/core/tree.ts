import { AppState, Item } from ".";

//
// Mutate tree
//

const updateIsOpenFlag = (item: Item) => {
  item.isOpen = item.children.length !== 0;
};

export const removeChildAt = (item: Item, index: number) => {
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

//
// Query tree
//

export const isFocused = (app: AppState, item: Item) =>
  app.itemFocused === item;

export const isRoot = (item: Item) => !item.parent;

export const hasChildren = (item: Item) => item.children.length > 0;

export const getItemIndex = (item: Item) => {
  if (!item.parent)
    throw new Error(
      "Trying to get item index without a parent. Item title: " + item.title
    );
  return item.parent.children.indexOf(item);
};

export const forEachChild = (item: Item, cb: A2<Item, Item>) => {
  const traverse = (children: Item[]) => {
    children.forEach((c) => {
      cb(c, item);
      if (hasChildren(c)) forEachChild(c, cb);
    });
  };
  traverse(item.children);
};

export const isOneOfTheParents = (item: Item, parent: Item) => {
  let current: Item | undefined = item;
  while (current) {
    if (current === parent) return true;
    current = current.parent;
  }
  return false;
};

export const getItemBelow = (app: AppState, item: Item): Item | undefined =>
  (item.isOpen && item.children.length > 0) || app.itemFocused == item
    ? item.children[0]
    : getFollowingItem(item);

export const getItemAbove = (item: Item): Item | undefined => {
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

export const getFollowingItem = (item: Item): Item | undefined => {
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

const getLastNestedItem = (item: Item): Item => {
  if (item.isOpen && item.children) {
    const { children } = item;
    return getLastNestedItem(children[children.length - 1]);
  }
  return item;
};

const isLast = (item: Item): boolean => !getFollowingSibling(item);
