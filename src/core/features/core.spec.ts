jest.mock("../../ui/input");
import { createApp, item, closedItem, spacings } from "../index";
import { exp, simulate } from "./testing";

describe("BASE", () => {
  it("creating a app with two items", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    exp.itemToHaveCoordinates(app, "Item 1", 0, 0);
    exp.itemToHaveCoordinates(app, "Item 2", 0, 1 * 28);
  });

  it("creating a app with nested items", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

    exp.itemToHaveCoordinates(app, "Item 1.1", 1 * 28, 1 * 28);
  });

  it("closing an item moves items below up", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

    exp.itemToHaveCoordinates(app, "Item 2", 0, 2 * spacings.gridSize);
    simulate.keydown(app, "KeyH");
    exp.itemToHaveCoordinates(app, "Item 2", 0, 1 * spacings.gridSize);
  });
});

describe("MOVING RIGHT", () => {
  it("when selected item is open moving right selects first child", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

    simulate.keydown(app, "KeyL");

    exp.selectedItemTitle(app, "Item 1.1");
  });

  it("when opening an item position of items below are updated", () => {
    const app = createApp([
      closedItem("Item 1", [item("Item 1.1")]),
      item("Item 2"),
    ]);

    exp.itemToHaveCoordinates(app, "Item 2", 0, 28);

    simulate.keydown(app, "KeyL");

    exp.itemToHaveCoordinates(app, "Item 1.1", 28, 28);
    exp.itemToHaveCoordinates(app, "Item 2", 0, 2 * 28);
  });
});

describe("MOVING DOWN", () => {
  it("having two items pressing down selectes Item 2", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    exp.selectedItemTitle(app, "Item 1");

    simulate.keydown(app, "KeyJ");
    exp.selectedItemTitle(app, "Item 2");
  });

  it("having two nested items pressing down selectes Item 1.1", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")])]);

    exp.selectedItemTitle(app, "Item 1");

    simulate.keydown(app, "KeyJ");
    exp.selectedItemTitle(app, "Item 1.1");
  });

  it("having three nested items when last item in branch in selected moving down selectes next sibling of the parent", () => {
    const app = createApp([
      item("Item 1", [item("Item 1.1", [item("Item 1.1.1")])]),
      item("Item 2"),
    ]);

    simulate.selectItem(app, "Item 1.1.1");
    exp.selectedItemTitle(app, "Item 1.1.1");

    simulate.keydown(app, "KeyJ");
    exp.selectedItemTitle(app, "Item 2");
  });

  it("when last item is selected moving down does nothing", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    simulate.selectItem(app, "Item 2");
    simulate.keydown(app, "KeyJ");
    exp.selectedItemTitle(app, "Item 2");
  });
});

describe("MOVING UP", () => {
  it("having two items pressing up selectes item above", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    simulate.selectItem(app, "Item 2");
    exp.selectedItemTitle(app, "Item 2");

    simulate.keydown(app, "KeyK");
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

    simulate.keydown(app, "KeyK");
    exp.selectedItemTitle(app, "Item 1.1.1");
  });
});

describe("MOVING LEFT", () => {
  it("having two nested items pressing left closes item", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")])]);

    exp.itemIsOpen(app, "Item 1", true);
    simulate.keydown(app, "KeyH");
    exp.itemIsOpen(app, "Item 1", false);
  });

  it("moving left on an empty item selects parent", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")])]);

    exp.selectedItemTitle(app, "Item 1");
    simulate.keydown(app, "KeyL");

    exp.selectedItemTitle(app, "Item 1.1");

    simulate.keydown(app, "KeyH");

    exp.selectedItemTitle(app, "Item 1");
  });

  it("when closing an item position of items below are updated", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

    exp.itemToHaveCoordinates(app, "Item 2", 0, 2 * 28);
    simulate.keydown(app, "KeyH");
    exp.itemToHaveCoordinates(app, "Item 2", 0, 1 * 28);
  });

  it("when trying to move left on a focused and closed item it does nothing", () => {
    const app = createApp([
      closedItem("Item 1", [item("Item 1.1")]),
      item("Item 2"),
    ]);

    simulate.keydown(app, "KeyL", { altKey: true });

    exp.itemToHaveCoordinates(app, "Item 1.1", 0, 1 * 28);
    simulate.keydown(app, "KeyH");

    exp.itemToHaveCoordinates(app, "Item 1.1", 0, 1 * 28);
  });

  it("when trying to move left on a focused and open item it does nothing", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

    simulate.keydown(app, "KeyL", { altKey: true });

    exp.itemToHaveCoordinates(app, "Item 1.1", 0, 1 * 28);
    simulate.keydown(app, "KeyH");

    exp.itemToHaveCoordinates(app, "Item 1.1", 0, 1 * 28);
  });
});

describe("FOCUS", () => {
  it("when focusing on closed item goind down select first child", () => {
    const app = createApp([
      closedItem("Item 1", [item("Item 1.1")]),
      item("Item 2"),
    ]);

    simulate.keydown(app, "KeyL", { altKey: true });

    simulate.keydown(app, "KeyJ");
    exp.selectedItemTitle(app, "Item 1.1");
  });

  it("when selecting last item in focus context going down does nothing", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

    simulate.keydown(app, "KeyL", { altKey: true });

    simulate.keydown(app, "KeyJ");
    exp.selectedItemTitle(app, "Item 1.1");

    simulate.keydown(app, "KeyJ");
    exp.selectedItemTitle(app, "Item 1.1");
  });

  it("when child is selected focusing on parent changes focus", () => {
    const app = createApp([
      item("Item 1", [item("Item 1.1", [item("Item 1.1.1")])]),
    ]);

    simulate.keydown(app, "KeyJ");
    simulate.keydown(app, "KeyL", { altKey: true });

    simulate.keydown(app, "KeyH", { altKey: true });
    expect(app.itemFocused.title).toBe("Item 1");

    simulate.keydown(app, "KeyH", { altKey: true });
    expect(app.itemFocused.title).toBe("Root");

    simulate.keydown(app, "KeyH", { altKey: true });
    expect(app.itemFocused.title).toBe("Root");
  });

  it("focusing on an item moves that item to the left by 1 grid cell and up by spacing.focusedItemOffset", () => {
    const app = createApp([
      item("Item 1", [item("Item 1.1", [item("Item 1.1.1")])]),
    ]);

    simulate.keydown(app, "KeyJ");
    simulate.keydown(app, "KeyL", { altKey: true });

    exp.itemToHaveCoordinates(app, "Item 1.1", -1 * 28, -10);

    exp.itemToHaveCoordinates(
      app,
      "Item 1.1",
      -1 * spacings.gridSize,
      spacings.titleOffsetFromTop
    );
  });
});

describe("EDITING", () => {
  it("pressing o creates an item under", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    exp.itemToHaveCoordinates(app, "Item 2", 0, 1 * 28);

    simulate.keydown(app, "KeyO");

    exp.firstLevelItems(app, ["Item 1", "", "Item 2"]);

    exp.selectedItemTitle(app, "");

    exp.itemToHaveCoordinates(app, "Item 2", 0, 2 * 28);
  });

  it("pressing O creates an item before", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    simulate.keydown(app, "KeyO", { shiftKey: true });

    exp.firstLevelItems(app, ["", "Item 1", "Item 2"]);

    exp.selectedItemTitle(app, "");
  });

  it("pressing I creates an item as first child of selected", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);

    exp.itemToHaveChildren(app, "Item 1", ["Item 1.1"]);
    simulate.keydown(app, "KeyI", { shiftKey: true });
    exp.itemToHaveChildren(app, "Item 1", ["", "Item 1.1"]);

    exp.selectedItemTitle(app, "");
  });

  it("pressing I creates an item as first child of selected and opens that item if empty", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    simulate.keydown(app, "KeyI", { shiftKey: true });
    exp.itemToHaveChildren(app, "Item 1", [""]);

    exp.itemIsOpen(app, "Item 1", true);
  });
});

describe("MOVEMENT", () => {
  it("having two items when second is moved right it becomes child of a previous one", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    simulate.selectItem(app, "Item 2");

    exp.itemIsOpen(app, "Item 1", false);

    simulate.keydown(app, "KeyL", { shiftKey: true, altKey: true });

    exp.firstLevelItems(app, ["Item 1"]);
    exp.itemToHaveChildren(app, "Item 1", ["Item 2"]);

    exp.itemIsOpen(app, "Item 1", true);
  });

  it("having two nested items when nested is moved left it becomes sibling of a parent", () => {
    const app = createApp([item("Item 1", [item("Item 1.1")])]);

    simulate.selectItem(app, "Item 1.1");

    simulate.keydown(app, "KeyH", { shiftKey: true, altKey: true });

    exp.firstLevelItems(app, ["Item 1", "Item 1.1"]);
  });

  it("having two items when second is moved up it swaps positions with sibling", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    simulate.keydown(app, "KeyJ", { shiftKey: true, altKey: true });

    exp.firstLevelItems(app, ["Item 2", "Item 1"]);
  });

  it("having two items when second is moved up it swaps positions with sibling", () => {
    const app = createApp([item("Item 1"), item("Item 2")]);

    simulate.selectItem(app, "Item 2");

    exp.itemToHaveCoordinates(app, "Item 1", 0, 0);

    simulate.keydown(app, "KeyK", { shiftKey: true, altKey: true });

    exp.firstLevelItems(app, ["Item 2", "Item 1"]);
    exp.itemToHaveCoordinates(app, "Item 2", 0, 0);
  });
});

describe("REMOVING", () => {
  it("having three items removing selected item selects other existing", () => {
    const app = createApp([
      item("Item 1", [item("Item 2.1"), item("Item 2.2")]),
      item("Item 2"),
      item("Item 3"),
    ]);

    simulate.selectItem(app, "Item 2");

    exp.itemToHaveCoordinates(app, "Item 3", 0, 4 * 28);

    simulate.keydown(app, "KeyX");

    exp.firstLevelItems(app, ["Item 1", "Item 3"]);

    exp.selectedItemTitle(app, "Item 2.2");

    exp.itemToHaveCoordinates(app, "Item 3", 0, 3 * 28);

    simulate.selectItem(app, "Item 1");
    simulate.keydown(app, "KeyX");

    exp.firstLevelItems(app, ["Item 3"]);
    exp.selectedItemTitle(app, "Item 3");
  });
});

it("removing item should remove it's view", () => {
  const app = createApp([item("Item 1", [item("Item 1.1")]), item("Item 2")]);
  const item1 = app.root.children[0];
  const item11 = app.root.children[0].children[0];

  expect(app.views.get(item1)).toBeDefined();
  expect(app.views.get(item11)).toBeDefined();

  simulate.keydown(app, "KeyX");

  expect(app.views.get(item1)).toBeUndefined();
  expect(app.views.get(item11)).toBeUndefined();
});
