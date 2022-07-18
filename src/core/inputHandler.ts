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
  mapPartialItem,
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
    if (event.shiftKey)
      dispatchCommand(app, createCreateItemCommand(app, "inside"));

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
    dispatchCommand(
      app,
      createCreateItemCommand(app, event.shiftKey ? "before" : "after")
    );

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
// - Remove - done
// - Rename
// - Create - done
// - Move

const createRemoveItemCommand = (itemRemoved: Item): RemoveCommand => ({
  type: "RemoveSelectedItem",
  itemRemoved,
  wasAtIndex: getItemIndex(itemRemoved),
});

const createCreateItemCommand = (
  app: AppState,
  position: CreatePosition
): CreateCommand => ({
  type: "CreateItem",
  previouslySelectedItem: app.selectedItem,
  item: mapPartialItem(""),
  position,
});

type RemoveCommand = {
  type: "RemoveSelectedItem";
  itemRemoved: Item;
  wasAtIndex: number;
};

type CreatePosition = "before" | "after" | "inside";
type CreateCommand = {
  type: "CreateItem";
  item: Item;
  position: CreatePosition;
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
  if (command.type === "RemoveSelectedItem") {
    removeItem(app, command.itemRemoved);
  }
  if (command.type === "CreateItem")
    createItemNearSelected(app, command.item, command.position);
};

const handleUndoCommand = (app: AppState, command: Command) => {
  if (command.type === "RemoveSelectedItem") undoRemove(app, command);
  if (command.type === "CreateItem") {
    removeItem(app, command.item);
    changeSelection(app, command.previouslySelectedItem);
  }
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

export const initialUndoState = () => ({
  currentHistoryIndex: -1,
  undoQueue: [] as Command[],
});

export type UndoState = ReturnType<typeof initialUndoState>;

const dispatchCommand = (app: AppState, command: Command) => {
  handleCommand(app, command);

  const { undo } = app;
  undo.undoQueue.splice(undo.currentHistoryIndex + 1);
  undo.undoQueue.push(command);
  undo.currentHistoryIndex += 1;
};

const undoLastCommand = (app: AppState) => {
  const { undo } = app;

  const command = undo.undoQueue[undo.currentHistoryIndex];

  if (command) {
    handleUndoCommand(app, command);
    undo.currentHistoryIndex -= 1;
  }
};

const redoCommand = (app: AppState) => {
  const { undo } = app;
  if (undo.currentHistoryIndex < undo.undoQueue.length - 1) {
    undo.currentHistoryIndex += 1;
    const upcomingCommand = undo.undoQueue[undo.currentHistoryIndex];
    if (upcomingCommand) handleCommand(app, upcomingCommand);
  }
};
