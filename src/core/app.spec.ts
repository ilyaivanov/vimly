jest.mock("../ui/input");
import {
  createApp,
  focusOnParentOfFocused,
  item,
  closedItem,
  mapPartialItem,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
} from "./app";

import { spacings } from "../ui/ui";
import { exp, simulate } from "./testing";

it("creating a app with two items", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  exp.itemToHaveGrid(app, "Item 1", 0, 0);
  exp.itemToHaveGrid(app, "Item 2", 0, 1);
});

it("creating a app with nested items", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  exp.itemToHaveGrid(app, "Item 1.1", 1, 1);
});

it("closing an item moves items below up", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  exp.itemToHaveCoordinates(app, "Item 2", 0, 2 * spacings.gridSize);
  moveLeft(app);
  exp.itemToHaveCoordinates(app, "Item 2", 0, 1 * spacings.gridSize);
});

// MOVING RIGHT
it("when selected item is open moving right selects first child", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  moveRight(app);

  exp.selectedItemTitle(app, "Item 1.1");
});

//MOVING DOWN
it("having two items pressing down selectes Item 2", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  exp.selectedItemTitle(app, "Item 1");

  moveDown(app);
  exp.selectedItemTitle(app, "Item 2");
});

it("having two nested items pressing down selectes Item 1.1", () => {
  const app = createApp([item("Item 1", [mapPartialItem("Item 1.1")])]);

  exp.selectedItemTitle(app, "Item 1");

  moveDown(app);
  exp.selectedItemTitle(app, "Item 1.1");
});

it("having three nested items when last item in branch in selected moving down selectes next sibling of the parent", () => {
  const app = createApp([
    item("Item 1", [item("Item 1.1", [item("Item 1.1.1")])]),
    item("Item 2"),
  ]);

  simulate.selectItem(app, "Item 1.1.1");
  exp.selectedItemTitle(app, "Item 1.1.1");

  moveDown(app);
  exp.selectedItemTitle(app, "Item 2");
});

it("when last item is selected moving down does nothing", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  simulate.selectItem(app, "Item 2");
  moveDown(app);
  exp.selectedItemTitle(app, "Item 2");
});

// MOVING UP
it("having two items pressing up selectes item above", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  simulate.selectItem(app, "Item 2");
  exp.selectedItemTitle(app, "Item 2");

  moveUp(app);
  exp.selectedItemTitle(app, "Item 1");
});

it("having three nested items when last item in branch in selected moving down selectes next sibling of the parent", () => {
  const app = createApp([
    item("Item 1", [
      item("Item 1.1", [closedItem("Item 1.1.1", [item("Item 1.1.1.1")])]),
    ]),
    item("Item 2"),
  ]);

  simulate.selectItem(app, "Item 2");
  exp.selectedItemTitle(app, "Item 2");

  moveUp(app);
  exp.selectedItemTitle(app, "Item 1.1.1");
});

// MOVING LEFT
it("having two nested items pressing left closes item", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")])]);

  exp.itemIsOpen(app, "Item 1", true);
  moveLeft(app);
  exp.itemIsOpen(app, "Item 1", false);
});

it("when closing an item position of items below are updated", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  exp.itemToHaveGrid(app, "Item 2", 0, 2);
  moveLeft(app);
  exp.itemToHaveGrid(app, "Item 2", 0, 1);
});

it("when opening an item position of items below are updated", () => {
  const app = createApp([
    closedItem("Item 1", [item("Item 1.1")]),
    item("Item 2"),
  ]);

  exp.itemToHaveGrid(app, "Item 2", 0, 1);

  moveRight(app);

  exp.itemToHaveGrid(app, "Item 1.1", 1, 1);
  exp.itemToHaveGrid(app, "Item 2", 0, 2);
});

it("when trying to move left on a focused and closed item it does nothing", () => {
  const app = createApp([
    closedItem("Item 1", [item("Item 1.1")]),
    item("Item 2"),
  ]);

  simulate.selectAndFocusItem(app, "Item 1");

  exp.itemToHaveGrid(app, "Item 1.1", 0, 1);
  moveLeft(app);

  exp.itemToHaveGrid(app, "Item 1.1", 0, 1);
});

it("when trying to move left on a focused and open item it does nothing", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  simulate.selectAndFocusItem(app, "Item 1");

  exp.itemToHaveGrid(app, "Item 1.1", 0, 1);
  moveLeft(app);

  exp.itemToHaveGrid(app, "Item 1.1", 0, 1);
});

// FOCUS
it("when focusing on closed item goind down select first child", () => {
  const app = createApp([
    closedItem("Item 1", [item("Item 1.1")]),
    item("Item 2"),
  ]);

  simulate.selectAndFocusItem(app, "Item 1");

  moveDown(app);
  exp.selectedItemTitle(app, "Item 1.1");
});

it("when selecting last item in focus context going down does nothing", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

  simulate.selectAndFocusItem(app, "Item 1");

  moveDown(app);
  exp.selectedItemTitle(app, "Item 1.1");

  moveDown(app);
  exp.selectedItemTitle(app, "Item 1.1");
});

it("when child is selected focusing on parent changes focus", () => {
  const app = createApp([
    item("Item 1", [item("Item 1.1", [item("Item 1.1.1")])]),
  ]);

  simulate.selectAndFocusItem(app, "Item 1.1");

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

  simulate.selectAndFocusItem(app, "Item 1.1");

  exp.itemToHaveGrid(app, "Item 1.1", -1, 0);

  exp.itemToHaveCoordinates(
    app,
    "Item 1.1",
    -1 * spacings.gridSize,
    spacings.titleOffsetFromTop
  );
});

//EDITING

it("having two items and selected first pressing o creates a new item under", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  simulate.keydown(app, "KeyO");

  exp.firstLevelItems(app, ["Item 1", "", "Item 2"]);

  exp.selectedItemTitle(app, "");
});

it("having two items and selected first pressing O creates a new item before", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  simulate.keydown(app, "KeyO", { shiftKey: true });

  exp.firstLevelItems(app, ["", "Item 1", "Item 2"]);

  exp.selectedItemTitle(app, "");
});
