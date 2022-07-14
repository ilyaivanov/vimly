jest.mock("../ui/input");
import {
  AppState,
  changeSelection,
  focusOnItemSelected,
  forEachChild,
  Item,
  ItemView,
} from "./app";

import { onKeyPress } from "./inputHandler";

//UTILS

export const simulate = {
  keydown: (app: AppState, key: string, modifiers?: { shiftKey?: boolean }) => {
    const event = new KeyboardEvent("keydown", { code: key, ...modifiers });

    onKeyPress(app, event);
  },

  selectAndFocusItem: (app: AppState, itemTitle: string) => {
    simulate.selectItem(app, itemTitle);
    focusOnItemSelected(app);
  },

  selectItem: (app: AppState, itemTitle: string) => {
    changeSelection(app, findItemByName(app, itemTitle));
  },
};

export const exp = {
  firstLevelItems: (app: AppState, items: string[]) => {
    expect(app.root.children.map((r) => r.title)).toEqual(items);
  },
  selectedItemTitle: (app: AppState, itemTitle: string) => {
    if (!app.selectedItem)
      throw new Error(
        `No item is selected. Expected ${itemTitle}, but was ${app.selectedItem}`
      );
    expect(app.selectedItem.title).toBe(itemTitle);
  },

  itemIsOpen: (app: AppState, itemTitle: string, isOpen: boolean) => {
    const item = findItemByName(app, itemTitle);

    verifyItemProp(item, "isOpen", isOpen);
  },

  itemToHaveGrid: (
    app: AppState,
    item: string,
    gridX: number,
    gridY: number
  ) => {
    const view = getView(app, item);

    verifyViewProp(view, "gridX", gridX);
    verifyViewProp(view, "gridY", gridY);
  },

  itemToHaveCoordinates: (
    app: AppState,
    item: string,
    x: number,
    y: number
  ) => {
    const view = getView(app, item);

    verifyViewProp(view, "x", x);
    verifyViewProp(view, "y", y);
  },
};

const verifyViewProp = (
  view: ItemView,
  propName: keyof ItemView,
  expectedValue: number
) => {
  const currentValue = view[propName];

  if (currentValue !== expectedValue) {
    throw new Error(
      `Expected ${view.item.title} to have ${propName} ${expectedValue} but got ${currentValue}`
    );
  }
};

const verifyItemProp = (
  item: Item,
  propName: keyof Item,
  expectedValue: unknown
) => {
  const currentValue = item[propName];

  if (currentValue !== expectedValue) {
    throw new Error(
      `Expected ${item.title} to have ${propName} ${expectedValue} but got ${currentValue}`
    );
  }
};

const getView = (app: AppState, item: string): ItemView => {
  const view = Array.from(app.views.values()).find(
    (v) => v.item.title === item
  );
  if (!view) throw new Error(`Item ${item} not found in views`);
  return view;
};

const findItemByName = (app: AppState, title: string): Item => {
  let item: Item | undefined;
  forEachChild(app.root, (c) => {
    if (c.title === title) item = c;
  });
  if (!item) throw new Error(`Item ${title} not found`);
  return item;
};
