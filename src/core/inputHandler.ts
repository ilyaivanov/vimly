import { itemEdited, showInput } from "../ui/input";
import * as actions from "./app";

export const onKeyPress = (app: actions.AppState, event: KeyboardEvent) => {
  if (itemEdited) return;

  if (event.code === "ArrowDown" || event.code === "KeyJ") {
    actions.moveDown(app);
  } else if (event.code === "ArrowUp" || event.code === "KeyK") {
    actions.moveUp(app);
  } else if (event.code === "ArrowLeft" || event.code === "KeyH") {
    if (event.altKey) actions.focusOnParentOfFocused(app);
    else actions.moveLeft(app);

    event.preventDefault();
  } else if (event.code === "ArrowRight" || event.code === "KeyL") {
    if (event.altKey) actions.focusOnItemSelected(app);
    else actions.moveRight(app);

    event.preventDefault();
  } else if (event.code === "KeyI") {
    showInput(app, "start");
    event.preventDefault();
  } else if (event.code === "KeyA" && event.shiftKey) {
    showInput(app, "end");
    event.preventDefault();
  } else if (event.code === "KeyR" && !event.ctrlKey) {
    if (app.selectedItem) {
      app.selectedItem.title = "";
      showInput(app, "start");
    }
    event.preventDefault();
  } else if (event.code === "KeyO") {
    actions.createItemNearSelected(app, event.shiftKey ? "before" : "after");
    event.preventDefault();
  }
};
