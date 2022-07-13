import {
  AppState,
  changeSelection,
  createApp,
  forEachChild,
  Item,
  mapPartialItem,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
} from "./app";

it("creating a app with two items", () => {
  const app = createApp([mapPartialItem("Item 1"), mapPartialItem("Item 2")]);

  expectItemToHaveGrid(app, "Item 1", 0, 0);
  expectItemToHaveGrid(app, "Item 2", 0, 1);
});

it("creating a app with nested items", () => {
  const app = createApp([
    mapPartialItem({
      title: "Item 1",
      children: [
        mapPartialItem("Item 1.1"),
        mapPartialItem({
          title: "Item 1.2",
          children: [
            mapPartialItem("Item 1.2.1"),
            mapPartialItem("Item 1.2.2"),
          ],
        }),
      ],
    }),
    mapPartialItem("Item 2"),
  ]);

  expectItemToHaveGrid(app, "Item 1.1", 1, 1);
});
//Moving down
it("having two items pressing down selectes Item 2", () => {
  const app = createApp([mapPartialItem("Item 1"), mapPartialItem("Item 2")]);

  expectItemToBeSelected(app, "Item 1");

  moveDown(app);
  expectItemToBeSelected(app, "Item 2");
});

it("having two nested items pressing down selectes Item 1.1", () => {
  const app = createApp([
    mapPartialItem({ title: "Item 1", children: [mapPartialItem("Item 1.1")] }),
  ]);

  expectItemToBeSelected(app, "Item 1");

  moveDown(app);
  expectItemToBeSelected(app, "Item 1.1");
});

it("having three nested items when last item in branch in selected moving down selectes next sibling of the parent", () => {
  const app = createApp([
    mapPartialItem({
      title: "Item 1",
      children: [
        mapPartialItem({
          title: "Item 1.1",
          children: [mapPartialItem("Item 1.1.1")],
        }),
      ],
    }),
    mapPartialItem({ title: "Item 2" }),
  ]);

  changeSelection(app, findItemByName(app, "Item 1.1.1"));
  expectItemToBeSelected(app, "Item 1.1.1");

  moveDown(app);
  expectItemToBeSelected(app, "Item 2");
});

it("when last item is selected moving down does nothing", () => {
  const app = createApp([mapPartialItem("Item 1"), mapPartialItem("Item 2")]);

  changeSelection(app, findItemByName(app, "Item 2"));
  moveDown(app);
  expectItemToBeSelected(app, "Item 2");
});

// Moving up
it("having two items pressing up selectes item above", () => {
  const app = createApp([mapPartialItem("Item 1"), mapPartialItem("Item 2")]);

  changeSelection(app, findItemByName(app, "Item 2"));
  expectItemToBeSelected(app, "Item 2");

  moveUp(app);
  expectItemToBeSelected(app, "Item 1");
});

it("having three nested items when last item in branch in selected moving down selectes next sibling of the parent", () => {
  const app = createApp([
    mapPartialItem({
      title: "Item 1",
      children: [
        mapPartialItem({
          title: "Item 1.1",
          children: [
            mapPartialItem({
              title: "Item 1.1.1",
              isOpen: false,
              children: [mapPartialItem("Item 1.1.1.1")],
            }),
          ],
        }),
      ],
    }),
    mapPartialItem({ title: "Item 2" }),
  ]);

  changeSelection(app, findItemByName(app, "Item 2"));
  expectItemToBeSelected(app, "Item 2");

  moveUp(app);
  expectItemToBeSelected(app, "Item 1.1.1");
});

// Moving left
it("having two nested items pressing left closes item", () => {
  const app = createApp([
    mapPartialItem({ title: "Item 1", children: [mapPartialItem("Item 1.1")] }),
  ]);

  const item1 = findItemByName(app, "Item 1");
  expect(app.views.get(item1)!.item.isOpen).toBe(true);
  moveLeft(app);
  expect(app.views.get(item1)!.item.isOpen).toBe(false);
});

it("when closing an item position of items below are updated", () => {
  const app = createApp([
    mapPartialItem({ title: "Item 1", children: [mapPartialItem("Item 1.1")] }),
    mapPartialItem("Item 2"),
  ]);

  const item2 = findItemByName(app, "Item 2");
  expect(app.views.get(item2)?.gridY).toBe(2);
  moveLeft(app);
  expect(app.views.get(item2)?.gridY).toBe(1);
});

it("when opening an item position of items below are updated", () => {
  const app = createApp([
    mapPartialItem({
      title: "Item 1",
      isOpen: false,
      children: [mapPartialItem("Item 1.1")],
    }),
    mapPartialItem("Item 2"),
  ]);

  const item2 = findItemByName(app, "Item 2");
  expect(app.views.get(item2)?.gridY).toBe(1);
  moveRight(app);
  expect(app.views.get(item2)?.gridY).toBe(2);

  const view11 = app.views.get(findItemByName(app, "Item 1.1"))!;
  expect(view11.gridX).toBe(1);
  expect(view11.gridY).toBe(1);
});

const expectItemToHaveGrid = (
  app: AppState,
  item: string,
  gridX: number,
  gridY: number
) => {
  const view = Array.from(app.views.values()).find(
    (v) => v.item.title === item
  );
  if (!view) throw new Error(`Item ${item} not found in views`);

  expect(view.gridX).toBe(gridX);
  expect(view.gridY).toBe(gridY);
};

const expectItemToBeSelected = (app: AppState, item: string) => {
  const view = Array.from(app.views.values()).find(
    (v) => v.item.title === item
  );
  if (!view) throw new Error(`Item ${item} not found in views`);

  expect(app.selectedItem!.title).toBe(item);
  expect(view.isSelected).toBe(true);
};

const findItemByName = (app: AppState, title: string): Item => {
  let item: Item | undefined;
  forEachChild(app.root, (c) => {
    if (c.title === title) item = c;
  });
  if (!item) throw new Error(`Item ${title} not found`);
  return item;
};
