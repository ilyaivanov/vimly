import {
  AppState,
  createApp,
  mapPartialItem,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
} from "./app";
import { drawApp, initCanvas, setOnResizeCb } from "./draw";

initCanvas();

const app = createApp([
  mapPartialItem({
    title: "Item 1",
    children: [
      mapPartialItem("Item 1.1"),
      mapPartialItem({
        title: "Item 1.2",
        children: [mapPartialItem("Item 1.2.1"), mapPartialItem("Item 1.2.2")],
      }),
    ],
  }),
  mapPartialItem("Item 2"),
]);

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
