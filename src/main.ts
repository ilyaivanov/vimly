import * as actions from "./core/app";
import { drawApp } from "./ui/draw";
import { initCanvas, setOnResizeCb } from "./ui/canvas";
import { onKeyPress } from "./core/inputHandler";

initCanvas();

const { item } = actions;

const app = actions.createApp([
  item("Viztly", [
    item("Viztly 1.1"),
    item("Viztly 1.2"),
    item("Viztly 1.3"),
    item("Viztly 1.4"),
    item("Viztly 1.5"),
  ]),
  item("Viztly 3"),
  item("Viztly 4"),
  item("Viztly 5"),
  item("Viztly 6"),
]);

document.addEventListener("keydown", (event) => {
  onKeyPress(app, event);
  drawApp(app);
});

drawApp(app);

setOnResizeCb(() => drawApp(app));
