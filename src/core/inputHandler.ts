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
  removeSelected,
} from "./app";
import { syncViews } from "./app.layout";

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
    else showInput(app, "start");
    event.preventDefault();
  } else if (event.code === "KeyA" && event.shiftKey) {
    showInput(app, "end");
    event.preventDefault();
  } else if (event.code === "KeyX") {
    removeSelected(app);
    event.preventDefault();
  } else if (event.code === "KeyR" && !event.ctrlKey) {
    if (app.selectedItem) {
      app.selectedItem.title = "";
      showInput(app, "start");
    }
    event.preventDefault();
  } else if (event.code === "KeyO") {
    createItemNearSelected(app, event.shiftKey ? "before" : "after");
    event.preventDefault();
  }

  syncViews(app);
};
