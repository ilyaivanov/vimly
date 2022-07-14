import { spacings } from "../ui/ui";
import {
  AppState,
  changeSelection,
  createApp,
  focusOnItemSelected,
  focusOnParentOfFocused,
  forEachChild,
  item,
  closedItem,
  Item,
  ItemView,
  mapPartialItem,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
} from "./app";

it("creating a app with two items", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  expectItemToHaveGrid(app, "Item 1", 0, 0);
  expectItemToHaveGrid(app, "Item 2", 0, 1);
});

it("creating a app with nested items", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  expectItemToHaveGrid(app, "Item 1.1", 1, 1);
});

it("closing an item moves items below up", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  expectItemToHaveCoordinates(app, "Item 2", 0, 2 * spacings.gridSize);
  moveLeft(app);
  expectItemToHaveCoordinates(app, "Item 2", 0, 1 * spacings.gridSize);
});

// MOVING RIGHT
it("when selected item is open moving right selects first child", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  moveRight(app);

  expectItemToBeSelected(app, "Item 1.1");
});

//MOVING DOWN
it("having two items pressing down selectes Item 2", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  expectItemToBeSelected(app, "Item 1");

  moveDown(app);
  expectItemToBeSelected(app, "Item 2");
});

it("having two nested items pressing down selectes Item 1.1", () => {
  const app = createApp([item("Item 1", [mapPartialItem("Item 1.1")])]);

  expectItemToBeSelected(app, "Item 1");

  moveDown(app);
  expectItemToBeSelected(app, "Item 1.1");
});

it("having three nested items when last item in branch in selected moving down selectes next sibling of the parent", () => {
  const app = createApp([
    item("Item 1", [item("Item 1.1", [item("Item 1.1.1")])]),
    item("Item 2"),
  ]);

  selectItem(app, "Item 1.1.1");
  expectItemToBeSelected(app, "Item 1.1.1");

  moveDown(app);
  expectItemToBeSelected(app, "Item 2");
});

it("when last item is selected moving down does nothing", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  selectItem(app, "Item 2");
  moveDown(app);
  expectItemToBeSelected(app, "Item 2");
});

// MOVING UP
it("having two items pressing up selectes item above", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  selectItem(app, "Item 2");
  expectItemToBeSelected(app, "Item 2");

  moveUp(app);
  expectItemToBeSelected(app, "Item 1");
});

it("having three nested items when last item in branch in selected moving down selectes next sibling of the parent", () => {
  const app = createApp([
    item("Item 1", [
      item("Item 1.1", [closedItem("Item 1.1.1", [item("Item 1.1.1.1")])]),
    ]),
    item("Item 2"),
  ]);

  selectItem(app, "Item 2");
  expectItemToBeSelected(app, "Item 2");

  moveUp(app);
  expectItemToBeSelected(app, "Item 1.1.1");
});

// MOVING LEFT
it("having two nested items pressing left closes item", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")])]);

  const item1 = findItemByName(app, "Item 1");
  expect(app.views.get(item1)!.item.isOpen).toBe(true);
  moveLeft(app);
  expect(app.views.get(item1)!.item.isOpen).toBe(false);
});

it("when closing an item position of items below are updated", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  const item2 = findItemByName(app, "Item 2");
  expect(app.views.get(item2)?.gridY).toBe(2);
  moveLeft(app);
  expect(app.views.get(item2)?.gridY).toBe(1);
});

it("when opening an item position of items below are updated", () => {
  const app = createApp([
    closedItem("Item 1", [item("Item 1.1")]),
    item("Item 2"),
  ]);

  const item2 = findItemByName(app, "Item 2");
  expect(app.views.get(item2)?.gridY).toBe(1);
  moveRight(app);
  expect(app.views.get(item2)?.gridY).toBe(2);

  const view11 = app.views.get(findItemByName(app, "Item 1.1"))!;
  expect(view11.gridX).toBe(1);
  expect(view11.gridY).toBe(1);
});

it("when trying to move left on a focused and closed item it does nothing", () => {
  const app = createApp([
    closedItem("Item 1", [item("Item 1.1")]),
    item("Item 2"),
  ]);

  selectAndFocusItem(app, "Item 1");

  expectItemToHaveGrid(app, "Item 1.1", 0, 1);
  moveLeft(app);

  expectItemToHaveGrid(app, "Item 1.1", 0, 1);
});

it("when trying to move left on a focused and open item it does nothing", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  selectAndFocusItem(app, "Item 1");

  expectItemToHaveGrid(app, "Item 1.1", 0, 1);
  moveLeft(app);

  expectItemToHaveGrid(app, "Item 1.1", 0, 1);
});

// FOCUS
it("when focusing on closed item goind down select first child", () => {
  const app = createApp([
    closedItem("Item 1", [item("Item 1.1")]),
    item("Item 2"),
  ]);

  selectAndFocusItem(app, "Item 1");

  moveDown(app);
  expectItemToBeSelected(app, "Item 1.1");
});

it("when selecting last item in focus context going down does nothing", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  selectAndFocusItem(app, "Item 1");

  moveDown(app);
  expectItemToBeSelected(app, "Item 1.1");

  moveDown(app);
  expectItemToBeSelected(app, "Item 1.1");
});

it("when child is selected focusing on parent changes focus", () => {
  const app = createApp([
    item("Item 1", [item("Item 1.1", [item("Item 1.1.1")])]),
  ]);

  selectAndFocusItem(app, "Item 1.1");

  focusOnParentOfFocused(app);
  expect(app.itemFocused.title).toBe("Item 1");

  focusOnParentOfFocused(app);
  expect(app.itemFocused.title).toBe("Root");

  focusOnParentOfFocused(app);
  expect(app.itemFocused.title).toBe("Root");
});

it("focusing on an item moves that item to the left by 1 grid cell and up by spacing.focusedItemOffset", () => {
  const app = createApp([
    item("Item 1", [item("Item 1.1", [item("Item 1.1.1")])]),
  ]);

  selectAndFocusItem(app, "Item 1.1");

  expectItemToHaveGrid(app, "Item 1.1", -1, 0);

  expectItemToHaveCoordinates(
    app,
    "Item 1.1",
    -1 * spacings.gridSize,
    spacings.titleOffsetFromTop
  );
});

//UTILS
const selectAndFocusItem = (app: AppState, itemTitle: string) => {
  selectItem(app, itemTitle);
  focusOnItemSelected(app);
};

const selectItem = (app: AppState, itemTitle: string) => {
  changeSelection(app, findItemByName(app, itemTitle));
};

const expectItemToHaveGrid = (
  app: AppState,
  item: string,
  gridX: number,
  gridY: number
) => {
  const view = getView(app, item);

  expect(view.gridX).toBe(gridX);
  expect(view.gridY).toBe(gridY);
};

const expectItemToHaveCoordinates = (
  app: AppState,
  item: string,
  x: number,
  y: number
) => {
  const view = getView(app, item);

  if (view.x !== x) {
    throw new Error(`Expected ${item} to have x ${x} but got ${view.x}`);
  }
  if (view.y !== y) {
    throw new Error(`Expected ${item} to have y ${y} but got ${view.y}`);
  }
};

const expectItemToBeSelected = (app: AppState, item: string) => {
  const view = Array.from(app.views.values()).find(
    (v) => v.item.title === item
  );
  if (!view) throw new Error(`Item ${item} not found in views`);

  expect(app.selectedItem!.title).toBe(item);
  expect(app.selectedItem).toBe(view.item);
};

const findItemByName = (app: AppState, title: string): Item => {
  let item: Item | undefined;
  forEachChild(app.root, (c) => {
    if (c.title === title) item = c;
  });
  if (!item) throw new Error(`Item ${title} not found`);
  return item;
};

const getView = (app: AppState, item: string): ItemView => {
  const view = Array.from(app.views.values()).find(
    (v) => v.item.title === item
  );
  if (!view) throw new Error(`Item ${item} not found in views`);
  return view;
};
