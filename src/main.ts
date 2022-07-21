import { loadFromLocalStorage, saveToLocalStorage } from "./core";
import { drawApp } from "./ui/draw";
import { initCanvas, setOnResizeCb } from "./ui/canvas";
import { onKeyPress, syncViews } from "./core";
import { loadFromFile, saveToFile } from "./core/persistance";
import { hideSidebar, setOnDraw } from "./ui/leftSidebar";
import { changeSelection, focusOnItem } from "./core/app";

initCanvas();

let app = loadFromLocalStorage();
syncViews(app);

document.addEventListener("keydown", async (event) => {
  if (app.focusOn === "lefttab") {
    const { leftSidebar } = app;
    if (event.code === "ArrowDown") {
      if (leftSidebar.selectedItemIndex < leftSidebar.results.length - 1)
        leftSidebar.selectedItemIndex += 1;
    } else if (event.code === "ArrowUp") {
      if (leftSidebar.selectedItemIndex > 0) leftSidebar.selectedItemIndex -= 1;
    } else if (event.code === "Enter") {
      const item =
        app.leftSidebar.results[app.leftSidebar.selectedItemIndex].item;
      focusOnItem(app, item);
      changeSelection(app, item);
      hideSidebar(app);
      syncViews(app);
    }
  } else {
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
  }

  drawApp(app);
  saveToLocalStorage(app);
});

drawApp(app);

setOnResizeCb(() => drawApp(app));

setOnDraw(() => drawApp(app));
