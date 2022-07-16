import { loadFromLocalStorage, saveToLocalStorage } from "./core";
import { drawApp } from "./ui/draw";
import { initCanvas, setOnResizeCb } from "./ui/canvas";
import { onKeyPress, syncViews } from "./core";
import { loadFromFile, saveToFile } from "./core/persistance";

initCanvas();

let app = loadFromLocalStorage();
syncViews(app);

document.addEventListener("keydown", async (event) => {
  if (event.code === "KeyS" && event.ctrlKey) {
    event.preventDefault();
    saveToFile(app);
  } else if (event.code === "KeyL" && event.ctrlKey) {
    event.preventDefault();
    app = await loadFromFile();
    syncViews(app);
  } else {
    onKeyPress(app, event);
  }

  drawApp(app);
  saveToLocalStorage(app);
});

drawApp(app);

setOnResizeCb(() => drawApp(app));
