import { itemEdited, showInput } from "../ui/input";
import {
  focusOnParentOfFocused,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
  AppState,
  moveSelectedItem,
  focusOnItemSelected,
  createItemNearSelected,
  removeItem,
  Item,
  changeSelection,
} from "./app";
import { syncViews } from "./app.layout";
import { rotateTheme } from "./themes";
import { addChildAt, getItemIndex } from "./tree";

export const onKeyPress = (app: AppState, event: KeyboardEvent) => {
  if (itemEdited) return;

  if (event.code === "ArrowDown" || event.code === "KeyJ") {
    if (event.shiftKey && event.altKey) moveSelectedItem(app, "down");
    else moveDown(app);
  } else if (event.code === "ArrowUp" || event.code === "KeyK") {
    if (event.shiftKey && event.altKey) moveSelectedItem(app, "up");
    else moveUp(app);
  } else if (event.code === "ArrowLeft" || event.code === "KeyH") {
    if (event.shiftKey && event.altKey) moveSelectedItem(app, "left");
    else if (event.altKey) focusOnParentOfFocused(app);
    else moveLeft(app);

    event.preventDefault();
  } else if (event.code === "ArrowRight" || event.code === "KeyL") {
    if (event.shiftKey && event.altKey) moveSelectedItem(app, "right");
    else if (event.altKey) focusOnItemSelected(app);
    else moveRight(app);

    event.preventDefault();
  } else if (event.code === "KeyI") {
    if (event.shiftKey) createItemNearSelected(app, "inside");

    // I need to call sync views before calling showInput, this results in calling syncViews two times during edit
    // this might be ineffective and can cause problems with animations
    syncViews(app);
    showInput(app, "start");

    event.preventDefault();
  } else if (event.code === "KeyA" && event.shiftKey) {
    syncViews(app);
    showInput(app, "end");

    event.preventDefault();
  } else if (event.code === "KeyX" && app.selectedItem) {
    dispatchCommand(app, createRemoveItemCommand(app.selectedItem));
    event.preventDefault();
  } else if (event.code === "KeyR" && !event.ctrlKey) {
    if (app.selectedItem) {
      app.selectedItem.title = "";

      syncViews(app);
      showInput(app, "start");
    }
    event.preventDefault();
  } else if (event.code === "KeyO") {
    createItemNearSelected(app, event.shiftKey ? "before" : "after");

    syncViews(app);
    showInput(app, "start");

    event.preventDefault();
  } else if (event.code === "F1") {
    rotateTheme();
    event.preventDefault();
  } else if (event.code === "KeyZ" && event.ctrlKey && event.shiftKey) {
    redoCommand(app);
    event.preventDefault();
  } else if (event.code === "KeyZ" && event.ctrlKey) {
    undoLastCommand(app);
    event.preventDefault();
  }

  syncViews(app);
};

// Commands
// - Remove
// - Rename
// - Create
// - Move
const createRemoveItemCommand = (itemRemoved: Item): RemoveCommand => ({
  type: "RemoveSelectedItem",
  itemRemoved,
  wasAtIndex: getItemIndex(itemRemoved),
});

const createCreateItemCommand = (app: AppState): CreateCommand => ({
  type: "CreateItem",

  previouslySelectedItem: app.selectedItem,
  item,
});

type RemoveCommand = {
  type: "RemoveSelectedItem";
  itemRemoved: Item;
  wasAtIndex: number;
};

type CreateCommand = {
  type: "CreateItem";
  item: Item;
  position: "before" | "after" | "inside";
  previouslySelectedItem?: Item;
};

export type Command = RemoveCommand | CreateCommand;

//
//
//
//
//
//

const handleCommand = (app: AppState, command: Command) => {
  if (command.type === "RemoveSelectedItem")
    removeItem(app, command.itemRemoved);
};

const handleUndoCommand = (app: AppState, command: Command) => {
  if (command.type === "RemoveSelectedItem") undoRemove(app, command);
};

const undoRemove = (
  app: AppState,
  { itemRemoved, wasAtIndex }: RemoveCommand
) => {
  if (itemRemoved.parent)
    addChildAt(itemRemoved.parent, itemRemoved, wasAtIndex);
  changeSelection(app, itemRemoved);
};

//
//
//
//
//
//

const dispatchCommand = (app: AppState, command: Command) => {
  handleCommand(app, command);

  //remove all items after currentHistoryIndex

  console.trace();
  app.undoQueue.length; //?
  app.undoQueue.push(command);
  app.currentHistoryIndex += 1;
};

const undoLastCommand = (app: AppState) => {
  const command = app.undoQueue[app.currentHistoryIndex];

  if (command) {
    handleUndoCommand(app, command);
    app.currentHistoryIndex -= 1;
  }
};

const redoCommand = (app: AppState) => {
  if (app.currentHistoryIndex < app.undoQueue.length - 1) {
    app.currentHistoryIndex += 1;
    const upcomingCommand = app.undoQueue[app.currentHistoryIndex];
    if (upcomingCommand) handleCommand(app, upcomingCommand);
  }
};
