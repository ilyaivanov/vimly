jest.mock("../../ui/input");
import { createApp, item } from "..";
import { exp, actions } from "../tests/testing";

it("when removing an item and pressing undo that items appears", () => {
  const app = createApp([item("Item 1"), item("Item 2"), item("Item 3")]);

  actions.moveDown(app);
  exp.selectedItemTitle(app, "Item 2");

  //removing
  actions.removeSelected(app);
  exp.selectedItemTitle(app, "Item 1");

  //undoing
  actions.undo(app);
  exp.selectedItemTitle(app, "Item 2");
  exp.firstLevelItems(app, ["Item 1", "Item 2", "Item 3"]);

  //undoing again does nothing
  actions.undo(app);
  exp.selectedItemTitle(app, "Item 2");
  exp.firstLevelItems(app, ["Item 1", "Item 2", "Item 3"]);

  //redoing
  actions.redo(app);
  exp.firstLevelItems(app, ["Item 1", "Item 3"]);

  //redoing again doesn nothing
  actions.redo(app);
  exp.selectedItemTitle(app, "Item 1");
  exp.firstLevelItems(app, ["Item 1", "Item 3"]);

  //undoing
  actions.undo(app);
  exp.selectedItemTitle(app, "Item 2");
  exp.firstLevelItems(app, ["Item 1", "Item 2", "Item 3"]);

  //undoing again does nothing
  actions.undo(app);
  exp.selectedItemTitle(app, "Item 2");
  exp.firstLevelItems(app, ["Item 1", "Item 2", "Item 3"]);
});

it("order of actions when undoing the operations preserves items order", () => {
  const app = createApp([item("Item 1"), item("Item 2"), item("Item 3")]);

  actions.removeSelected(app);
  exp.firstLevelItems(app, ["Item 2", "Item 3"]);

  actions.undo(app);
  exp.firstLevelItems(app, ["Item 1", "Item 2", "Item 3"]);

  actions.moveDown(app);

  actions.removeSelected(app);
  exp.firstLevelItems(app, ["Item 1", "Item 3"]);

  actions.undo(app);
  exp.firstLevelItems(app, ["Item 1", "Item 2", "Item 3"]);
});

it("creating a node is an undoable operation with saved selected item", () => {
  const app = createApp([item("Item 1"), item("Item 2")]);

  actions.moveDown(app);
  actions.createItemBeforeSelected(app);
  exp.firstLevelItems(app, ["Item 1", "", "Item 2"]);

  actions.undo(app);
  exp.firstLevelItems(app, ["Item 1", "Item 2"]);
  exp.selectedItemTitle(app, "Item 2");
});
