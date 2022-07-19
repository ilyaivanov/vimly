import { itemEdited, showInput } from "../ui/input";
import {
  focusOnParentOfFocused,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
  AppState,
  focusOnItemSelected,
} from "./app";
import { syncViews } from "./app.layout";
import { create, removeSelected, redo, undo, moveSelected } from "./commands";
import { rotateTheme } from "./themes";

export const onKeyPress = (app: AppState, event: KeyboardEvent) => {
  if (itemEdited) return;

  if (event.code === "ArrowDown" || event.code === "KeyJ") {
    if (event.shiftKey && event.altKey) moveSelected(app, "down");
    else moveDown(app);
  } else if (event.code === "ArrowUp" || event.code === "KeyK") {
    if (event.shiftKey && event.altKey) moveSelected(app, "up");
    else moveUp(app);
  } else if (event.code === "ArrowLeft" || event.code === "KeyH") {
    if (event.shiftKey && event.altKey) moveSelected(app, "left");
    else if (event.altKey) focusOnParentOfFocused(app);
    else moveLeft(app);

    event.preventDefault();
  } else if (event.code === "ArrowRight" || event.code === "KeyL") {
    if (event.shiftKey && event.altKey) moveSelected(app, "right");
    else if (event.altKey) focusOnItemSelected(app);
    else moveRight(app);

    event.preventDefault();
  } else if (event.code === "KeyI") {
    if (event.shiftKey) create(app, "inside");

    // I need to call sync views before calling showInput, this results in calling syncViews two times during edit
    // this might be ineffective and can cause problems with animations
    syncViews(app);
    showInput(app, app.selectedItem?.title || "", "start");

    event.preventDefault();
  } else if (event.code === "KeyA" && event.shiftKey) {
    syncViews(app);
    showInput(app, app.selectedItem?.title || "", "end");

    event.preventDefault();
  } else if (event.code === "KeyX" && app.selectedItem) {
    removeSelected(app);
    event.preventDefault();
  } else if (event.code === "KeyR" && !event.ctrlKey) {
    syncViews(app);
    showInput(app, "", "start");
    event.preventDefault();
  } else if (event.code === "KeyO") {
    create(app, event.shiftKey ? "before" : "after");

    syncViews(app);
    showInput(app, app.selectedItem?.title || "", "start");

    event.preventDefault();
  } else if (event.code === "F1") {
    rotateTheme();
    event.preventDefault();
  } else if (event.code === "KeyZ" && event.ctrlKey && event.shiftKey) {
    redo(app);
    event.preventDefault();
  } else if (event.code === "KeyZ" && event.ctrlKey) {
    undo(app);
    event.preventDefault();
  }

  syncViews(app);
};
