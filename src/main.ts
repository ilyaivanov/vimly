import * as actions from "./core/app";
import { drawApp, initCanvas, setOnResizeCb } from "./ui/draw";
import data from "./data/viztly.json";
import { itemEdited, showInput } from "./ui/input";

initCanvas();

const app = actions.createApp(data.children as any);

document.addEventListener("keydown", (event) => {
  if (itemEdited) return;

  if (event.code === "ArrowDown") {
    actions.moveDown(app);
  } else if (event.code === "ArrowUp") {
    actions.moveUp(app);
  } else if (event.code === "ArrowLeft") {
    if (event.altKey) actions.focusOnParentOfFocused(app);
    else actions.moveLeft(app);

    event.preventDefault();
  } else if (event.code === "ArrowRight") {
    if (event.altKey) actions.focusOnItemSelected(app);
    else actions.moveRight(app);

    event.preventDefault();
  } else if (event.code === "KeyE") {
    showInput(app);
    event.preventDefault();
  }
  drawApp(app);
});
drawApp(app);
setOnResizeCb(() => drawApp(app));
