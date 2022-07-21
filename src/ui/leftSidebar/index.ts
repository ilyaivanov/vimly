import { AppState, spacings } from "../../core";
import { drawTextAt, findLocalItems, LocalSearchEntry } from "./modal.text";

let onDrawCb: () => void;

export const setOnDraw = (cb: typeof onDrawCb) => (onDrawCb = cb);

export type LeftSidebar = {
  isVisible: boolean;
  isLoading: boolean;
  results: LocalSearchEntry[];

  selectedItemIndex: number;
  width: number;
};

export const initialState = (): LeftSidebar => ({
  isVisible: false,
  isLoading: false,
  results: [],
  selectedItemIndex: 0,
  width: 0,
});

export const drawSidebar = (app: AppState) => {
  const { leftSidebar } = app;
  if (leftSidebar.isVisible) {
    const { ctx } = window;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.1)";

    ctx.moveTo(leftSidebar.width, 0);
    ctx.lineTo(leftSidebar.width, 1200);
    ctx.stroke();

    for (let i = 0; i < leftSidebar.results.length; i += 1) {
      const item = leftSidebar.results[i];

      drawTextAt(20, 80 + i * 24, item, leftSidebar.selectedItemIndex == i);
    }

    ctx.translate(leftSidebar.width, 0);
  }
};

let input: HTMLInputElement | undefined;

const keydown = (app: AppState) => {
  const { leftSidebar, root } = app;
  const text = input?.value || "";
  if (text) {
    const results = findLocalItems(root, text);
    leftSidebar.results = results.items;
    leftSidebar.selectedItemIndex = 0;
    onDrawCb && onDrawCb();
  }
};

export const showSidebar = (app: AppState) => {
  app.leftSidebar.isVisible = true;
  app.leftSidebar.width = 200;

  input = document.createElement("input");
  input.type = "text";
  input.classList.add("text-input");

  Object.assign(input.style, {
    top: "20px",
    left: "20px",
    color: "white",
    fontSize: "14px",
    fontFamily: spacings.fontFace,
    overflow: "hidden",
    width: 200 - 20 * 2 - 10 * 2 + "px",
    padding: "6px 10px",
    backgroundColor: "rgba(255,255,255,0.1)",
  });
  document.body.appendChild(input);
  input.focus();

  input.addEventListener("input", () => keydown(app));
};

export const hideSidebar = (app: AppState) => {
  app.leftSidebar.isVisible = false;
  app.leftSidebar.width = 0;

  input?.remove();
  input = undefined;
  app.focusOn = "main";
};
