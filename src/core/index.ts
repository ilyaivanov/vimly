export type { AppState, Item } from "./app";
export type { ItemView } from "./app.layout";

export { item, closedItem, changeSelection } from "./app";
export { onKeyPress } from "./inputHandler";
export { hasChildren, forEachChild } from "./tree";
export { spacings } from "./spacings";
export { theme } from "./themes";

export { loadFromLocalStorage, saveToLocalStorage } from "./persistance";
export { syncViews } from "./app.layout";

import { Item, AppState } from "./app";
import { syncViews } from "./app.layout";
import { createApp as ca } from "./persistance";

export const createApp = (items: Item[]): AppState => {
  const app = ca(items);
  syncViews(app);
  return app;
};
