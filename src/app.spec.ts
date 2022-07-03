import {
  AppState,
  changeSelection,
  createApp,
  forEachChild,
  Item,
  mapPartialItem,
  moveDown,
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

const expectItemToHaveGrid = (
  app: AppState,
  item: string,
  gridX: number,
  gridY: number
) => {
  const view = app.views.find((v) => v.item.title === item);
  if (!view) throw new Error(`Item ${item} not found in views`);

  expect(view.gridX).toBe(gridX);
  expect(view.gridY).toBe(gridY);
};

const expectItemToBeSelected = (app: AppState, item: string) => {
  const view = app.views.find((v) => v.item.title === item);
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
