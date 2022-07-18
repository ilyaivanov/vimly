import {
  AppState,
  createItemNearSelected,
  removeItem,
  Item,
  changeSelection,
  mapPartialItem,
  MovingDirection,
  moveSelectedItem,
} from "./app";
import { addChildAt, getItemIndex } from "./tree";

//
// REMOVE ITEM
//

type RemoveCommand = {
  type: "RemoveSelectedItem";
  itemRemoved: Item;
  wasAtIndex: number;
};

export const removeItemCommand = (app: AppState, itemRemoved: Item) =>
  dispatchCommand(app, {
    type: "RemoveSelectedItem",
    itemRemoved,
    wasAtIndex: getItemIndex(itemRemoved),
  });

const undoRemove = (
  app: AppState,
  { itemRemoved, wasAtIndex }: RemoveCommand
) => {
  if (itemRemoved.parent)
    addChildAt(itemRemoved.parent, itemRemoved, wasAtIndex);
  changeSelection(app, itemRemoved);
};

//
// RENAME ITEM
//

type RenameCommand = {
  type: "RenameItem";
  item: Item;
  oldName: string;
  newName: string;
};

export const renameItemCommand = (app: AppState, item: Item, newName: string) =>
  dispatchCommand(app, {
    type: "RenameItem",
    item,
    oldName: item.title,
    newName,
  });

const undoRename = (app: AppState, { item, oldName }: RenameCommand) => {
  item.title = oldName;
};

const doRename = (app: AppState, { item, newName }: RenameCommand) => {
  item.title = newName;
};

//
// CREATE ITEM
//
type CreatePosition = "before" | "after" | "inside";
type CreateCommand = {
  type: "CreateItem";
  item: Item;
  position: CreatePosition;
  previouslySelectedItem?: Item;
};

export const createItemCommand = (app: AppState, position: CreatePosition) =>
  dispatchCommand(app, {
    type: "CreateItem",
    previouslySelectedItem: app.selectedItem,
    item: mapPartialItem(""),
    position,
  });

//
// MOVE ITEM
//

type MoveCommand = {
  type: "MoveItem";
  movingDirection: MovingDirection;
  item: Item;
  currentParent: Item;
  currentPosition: number;
};

export const moveSelectedItemCommand = (
  app: AppState,
  movingDirection: MovingDirection
) =>
  app.selectedItem &&
  app.selectedItem.parent &&
  dispatchCommand(app, {
    type: "MoveItem",
    item: app.selectedItem,
    currentParent: app.selectedItem.parent,
    currentPosition: getItemIndex(app.selectedItem),
    movingDirection,
  });

const undoMove = (app: AppState, command: MoveCommand) => {
  removeItem(app, command.item);
  addChildAt(command.currentParent, command.item, command.currentPosition);
};

const doMove = (app: AppState, command: MoveCommand) => {
  moveSelectedItem(app, command.item, command.movingDirection);
};

//
//
//
//
//
//

const handleCommand = (app: AppState, command: Command) => {
  if (command.type === "RemoveSelectedItem")
    removeItem(app, command.itemRemoved);
  else if (command.type === "CreateItem")
    createItemNearSelected(app, command.item, command.position);
  else if (command.type === "RenameItem") doRename(app, command);
  else if (command.type === "MoveItem") doMove(app, command);
  else assumeNever(command);
};

const handleUndoCommand = (app: AppState, command: Command) => {
  if (command.type === "RemoveSelectedItem") undoRemove(app, command);
  else if (command.type === "CreateItem") {
    removeItem(app, command.item);
    changeSelection(app, command.previouslySelectedItem);
  } else if (command.type === "RenameItem") undoRename(app, command);
  else if (command.type === "MoveItem") undoMove(app, command);
  else assumeNever(command);
};

const assumeNever = (e: never) => {
  process.env.NODE_ENV !== "production" && console.error(e);
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
export type Command =
  | RemoveCommand
  | CreateCommand
  | RenameCommand
  | MoveCommand;
export type UndoState = ReturnType<typeof initialUndoState>;

const dispatchCommand = (app: AppState, command: Command) => {
  handleCommand(app, command);

  const { undo } = app;
  undo.undoQueue.splice(undo.currentHistoryIndex + 1);
  undo.undoQueue.push(command);
  undo.currentHistoryIndex += 1;
};

export const undo = (app: AppState) => {
  const { undo } = app;

  const command = undo.undoQueue[undo.currentHistoryIndex];

  if (command) {
    handleUndoCommand(app, command);
    undo.currentHistoryIndex -= 1;
  }
};

export const redo = (app: AppState) => {
  const { undo } = app;
  if (undo.currentHistoryIndex < undo.undoQueue.length - 1) {
    undo.currentHistoryIndex += 1;
    const upcomingCommand = undo.undoQueue[undo.currentHistoryIndex];
    if (upcomingCommand) handleCommand(app, upcomingCommand);
  }
};
