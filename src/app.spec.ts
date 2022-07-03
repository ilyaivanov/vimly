import { AppState, createApp, createItem } from "./app";

it("creating a app with two items", () => {
  const app = createApp([createItem("Item 1"), createItem("Item 2")]);

  expectItemToHaveGrid(app, "Item 1", 0, 0);
  expectItemToHaveGrid(app, "Item 2", 0, 1);
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
