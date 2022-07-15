import { showInput } from "../ui/input";
import { spacings, theme } from "../ui/ui";
import {
  addChildAt,
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

  layout(app, root, (item, gridX, gridY) =>
    app.views.set(item, createView(app, item, gridX, gridY))
  );

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
    layout(app, app.itemFocused, (item, gridX, gridY) => {
      app.views.set(item, createView(app, item, gridX, gridY));
    });
  }
};

type LayoutCallback = (item: Item, gridX: number, gridY: number) => void;

const layout = (app: AppState, item: Item, cb: LayoutCallback) =>
  traverseItems(
    app,
    isRoot(item) ? item.children : [item],
    isRoot(item) ? 0 : -1,
    0,
    cb
  );

const traverseItems = (
  app: AppState,
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
      (hasVisibleChildren(app, child)
        ? traverseItems(app, child.children, gridX + 1, currentGridY + 1, fn)
        : 0)
    );
  }, 0);

const hasVisibleChildren = (app: AppState, item: Item) =>
  (item.isOpen && item.children.length > 0) || app.itemFocused == item;

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
      layout(app, app.itemFocused, (item, gridX, gridY) => {
        const view = app.views.get(item);
        if (view) updateView(app, view, gridX, gridY);
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
      layout(app, app.itemFocused, (item, gridX, gridY) => {
        const view = app.views.get(item);
        if (view) updateView(app, view, gridX, gridY);
        else app.views.set(item, createView(app, item, gridX, gridY));
      });
    }
  }
};

export const changeSelection = (app: AppState, item: Item | undefined) => {
  if (!item || !isOneOfTheParents(item, app.itemFocused)) return;
  const currentItem = app.selectedItem;
  app.selectedItem = item;
  if (item.view) {
    updateView(app, item.view, item.view.gridX, item.view.gridY);
  }
  if (currentItem?.view) {
    const { view } = currentItem;
    updateView(app, view, view.gridX, view.gridY);
  }
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

    layout(app, app.itemFocused, (item, gridX, gridY) => {
      const view = app.views.get(item);
      if (view) updateView(app, view, gridX, gridY);
      else app.views.set(item, createView(app, item, gridX, gridY));
    });

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

    layout(app, app.itemFocused, (item, gridX, gridY) => {
      const view = app.views.get(item);
      if (view) updateView(app, view, gridX, gridY);
      else app.views.set(item, createView(app, item, gridX, gridY));
    });
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
    layout(app, app.itemFocused, (item, gridX, gridY) => {
      const view = app.views.get(item);
      if (view) updateView(app, view, gridX, gridY);
      else app.views.set(item, createView(app, item, gridX, gridY));
    });
  }
};

const createView = (
  app: AppState,
  item: Item,
  gridX: number,
  gridY: number
): ItemView => {
  const x = calcXCoordiante(gridX);
  const y = calcYCoordiante(app, item, gridY);
  const isSelected = app.selectedItem == item;

  const view: ItemView = {
    gridX,
    gridY,
    x,
    y,
    item,
    fontSize: getFontSize(gridX),
    circleColor: getCircleColor(isSelected),
    textColor: getTextColor(isSelected, gridX),
  };
  item.view = view;
  return view;
};

const updateView = (
  app: AppState,
  view: ItemView,
  gridX: number,
  gridY: number
): ItemView => {
  view.gridX = gridX;
  view.gridY = gridY;
  view.x = calcXCoordiante(gridX);
  view.y = calcYCoordiante(app, view.item, gridY);

  const isSelected = app.selectedItem == view.item;
  view.fontSize = getFontSize(gridX);
  view.circleColor = getCircleColor(isSelected);
  view.textColor = getTextColor(isSelected, gridX);
  return view;
};

const getFontSize = (gridX: number) =>
  gridX == -1
    ? spacings.titleFontSize
    : gridX == 0
    ? spacings.firstLevelfontSize
    : spacings.fontSize;

const getTextColor = (isSelected: boolean, gridX: number) =>
  isSelected
    ? theme.selected
    : gridX == -1 || gridX == 0
    ? theme.firstLevelFont
    : theme.font;

const getCircleColor = (isSelected: boolean) =>
  isSelected ? theme.selected : theme.filledCircle;

const calcXCoordiante = (gridX: number): number => gridX * spacings.gridSize;

const calcYCoordiante = (app: AppState, item: Item, gridY: number): number => {
  const isFocused = app.itemFocused == item;
  return (
    gridY * spacings.gridSize + (isFocused ? spacings.titleOffsetFromTop : 0)
  );
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

export const isRoot = (item: Item) => !item.parent;

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

export const hasChildren = (item: Item) => item.children.length > 0;
