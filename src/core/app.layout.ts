import { AppState, Item, spacings, theme } from ".";
import { isRoot } from "./tree";

const markedSets = new Set<ItemView>();
export const syncViews = (app: AppState) => {
  markedSets.clear();
  layout(app, app.itemFocused, (item, gridX, gridY) => {
    const view = app.views.get(item);

    if (view) {
      // Move animation
      updateView(app, view, gridX, gridY);
      markedSets.add(view);
    } else {
      // Enter animation
      const newView = createView(app, item, gridX, gridY);
      app.views.set(item, newView);
      markedSets.add(newView);
    }
  });

  //Exit animation
  app.views.forEach((view, item) => {
    if (!markedSets.has(view)) app.views.delete(item);
  });
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

// View related stuff

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
