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

export const initialUndoState = () => ({
  currentHistoryIndex: -1,
  undoQueue: [] as SerializedCommand[],
});

export type UndoState = ReturnType<typeof initialUndoState>;

export const create = (app: AppState, position: CreatePosition) =>
  app.selectedItem &&
  dispatch(app, "create", {
    item: mapPartialItem(""),
    position,
    previouslySelectedItem: app.selectedItem,
  });

export const removeSelected = (app: AppState) =>
  app.selectedItem &&
  dispatch(app, "remove", {
    itemRemoved: app.selectedItem,
    wasAtIndex: getItemIndex(app.selectedItem),
  });

export const moveSelected = (app: AppState, movingDirection: MovingDirection) =>
  app.selectedItem &&
  app.selectedItem.parent &&
  dispatch(app, "move", {
    item: app.selectedItem,
    currentParent: app.selectedItem.parent,
    currentPosition: getItemIndex(app.selectedItem),
    movingDirection,
  });

export const renameSelected = (app: AppState, title: string) =>
  app.selectedItem &&
  dispatch(app, "rename", {
    item: app.selectedItem,
    newName: title,
    oldName: app.selectedItem.title,
  });

type CreatePosition = "before" | "after" | "inside";
type Commands = {
  remove: {
    itemRemoved: Item;
    wasAtIndex: number;
  };
  rename: {
    item: Item;
    oldName: string;
    newName: string;
  };
  create: {
    item: Item;
    position: CreatePosition;
    previouslySelectedItem?: Item;
  };
  move: {
    movingDirection: MovingDirection;
    item: Item;
    currentParent: Item;
    currentPosition: number;
  };
  select: {
    currentItem: Item;
    nextItem: Item;
  };
};

type CommandHandlers = {
  [CommandType in keyof Commands]: A2<AppState, Commands[CommandType]>;
};

const doHandlers: CommandHandlers = {
  rename: (app, { item, newName }) => {
    item.title = newName;
  },
  remove: (app, command) => {
    removeItem(app, command.itemRemoved);
  },
  create: (app, command) => {
    createItemNearSelected(app, command.item, command.position);
  },
  move: (app, { item, movingDirection }) => {
    moveSelectedItem(app, item, movingDirection);
  },
  select: (app, { nextItem }) => {
    changeSelection(app, nextItem);
  },
};

const undoHandlers: CommandHandlers = {
  rename: (app, { item, oldName }) => {
    item.title = oldName;
  },
  remove: (app, { itemRemoved, wasAtIndex }) => {
    if (itemRemoved.parent)
      addChildAt(itemRemoved.parent, itemRemoved, wasAtIndex);
    changeSelection(app, itemRemoved);
  },
  create: (app, command) => {
    removeItem(app, command.item);
    changeSelection(app, command.previouslySelectedItem);
  },
  move: (app, { item, currentParent, currentPosition }) => {
    removeItem(app, item);
    addChildAt(currentParent, item, currentPosition);
  },
  select: (app, { currentItem }) => {
    changeSelection(app, currentItem);
  },
};

//
// Infrastructure
//

type SerializedCommand = {
  commandName: string;
  payload: unknown;
};

const dispatch = <T extends keyof Commands>(
  app: AppState,
  commandName: T,
  payload: Commands[T]
) => {
  performCommand(app, commandName, payload);

  const { undo } = app;
  undo.undoQueue.splice(undo.currentHistoryIndex + 1);

  undo.undoQueue.push({ commandName, payload });

  undo.currentHistoryIndex += 1;
};

const performCommand = <T extends keyof Commands>(
  app: AppState,
  commandName: T,
  payload: Commands[T]
) => doHandlers[commandName](app, payload);

const undoCommand = <T extends keyof Commands>(
  app: AppState,
  commandName: T,
  payload: Commands[T]
) => undoHandlers[commandName](app, payload);

export const undo = (app: AppState) => {
  const { undo } = app;

  const command = undo.undoQueue[undo.currentHistoryIndex];

  if (command) {
    const { commandName, payload } = command;

    // Need better typings for undoQueue
    undoCommand(app, commandName as keyof Commands, payload as never);
    undo.currentHistoryIndex -= 1;
  }
};

export const redo = (app: AppState) => {
  const { undo } = app;
  if (undo.currentHistoryIndex < undo.undoQueue.length - 1) {
    undo.currentHistoryIndex += 1;
    const upcomingCommand = undo.undoQueue[undo.currentHistoryIndex];
    if (upcomingCommand) {
      const { commandName, payload } = upcomingCommand;

      // Need better typings for undoQueue
      performCommand(app, commandName as keyof Commands, payload as never);
    }
  }
};
