import { createApp, moveDown, moveLeft, moveRight, moveUp } from "./app";
import { drawApp, initCanvas, setOnResizeCb } from "./draw";
import data from "./data/viztly.json";

initCanvas();

const app = createApp(data.children as any);

document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowDown") {
    moveDown(app);
  } else if (event.code === "ArrowUp") {
    moveUp(app);
  } else if (event.code === "ArrowLeft") {
    moveLeft(app);
  } else if (event.code === "ArrowRight") {
    moveRight(app);
  }
  drawApp(app);
});
drawApp(app);
setOnResizeCb(() => drawApp(app));
