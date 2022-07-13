import { AppState, hasChildren, isRoot, ItemView } from "../core/app";
import { spacings, theme } from "./ui";

// Canvas Infra
let xOffset = 0;

let onResizeCb: () => void;

export const setOnResizeCb = (cb: typeof onResizeCb) => (onResizeCb = cb);

export const initCanvas = () => {
  const canvas = document.createElement("canvas");

  document.body.appendChild(canvas);
  const assignDimensions = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    xOffset = roundToWhole(
      Math.max(0, (width - spacings.viewportMaxWidth) / 2)
    );

    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener("resize", () => {
    assignDimensions();
    onResizeCb && onResizeCb();
  });
  assignDimensions();

  const canvasContext = canvas.getContext("2d")!;

  document.body.style.backgroundColor = theme.bg;
  window.ctx = canvasContext;
};

// Canvas Drawings
const fillCircle = (x: number, y: number, r: number, color: string) => {
  window.ctx.fillStyle = color;
  window.ctx.beginPath();
  window.ctx.arc(x, y, r, 0, 2 * Math.PI);
  window.ctx.fill();
};

const outlineCircle = (
  x: number,
  y: number,
  r: number,
  lineWidth: number,
  color: string
) => {
  window.ctx.strokeStyle = color;
  window.ctx.beginPath();
  window.ctx.arc(x, y, r, 0, 2 * Math.PI);
  window.ctx.lineWidth = lineWidth;
  window.ctx.stroke();
};

const fillTextAtMiddle = (
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string
) => {
  window.ctx.fillStyle = color;
  window.ctx.textBaseline = "middle";
  window.ctx.font = `400 ${fontSize}px ${spacings.fontFace}, sans-serif`;
  window.ctx.fillText(text, x, y);
};

declare global {
  interface Window {
    ctx: CanvasRenderingContext2D;
  }
}

// APP

export const drawApp = (app: AppState) => {
  window.ctx.fillStyle = theme.bg;
  window.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  window.ctx.translate(xOffset, spacings.offsetFromTop);

  // window.ctx.scale(15, 15);

  if (!isRoot(app.itemFocused)) {
    const textColor =
      app.itemFocused == app.selectedItem ? theme.selected : theme.titleFont;

    fillTextAtMiddle(
      app.itemFocused.title,
      -7,
      0,
      spacings.titleFontSize,
      textColor
    );
    window.ctx.translate(0, 40);
  }

  for (const item of app.views.keys()) {
    const view = app.views.get(item);
    if (view) {
      const parentView =
        view.item.parent && view.item.parent !== app.itemFocused
          ? view.item.parent.view
          : undefined;
      viewItem(app, view, parentView);
    }
  }
  window.ctx.resetTransform();
};

const viewItem = (
  app: AppState,
  view: ItemView,
  parentView: ItemView | undefined
) => {
  const x = view.gridX * spacings.gridSize;
  const y = view.gridY * spacings.gridSize;
  const color = view.isSelected ? theme.selected : theme.filledCircle;

  const isFirstLevel = view.item.parent == app.itemFocused;

  const textColor = view.isSelected
    ? theme.selected
    : isFirstLevel
    ? theme.firstLevelFont
    : theme.font;

  const textYOffset = 1;
  const textXOffset = spacings.textFromCircleDistance;

  if (hasChildren(view.item)) fillCircle(x, y, spacings.circleRadius, color);

  outlineCircle(x, y, spacings.circleRadius, spacings.circleLineWidth, color);

  fillTextAtMiddle(
    view.item.title,
    x + textXOffset,
    y + textYOffset,
    isFirstLevel ? spacings.firstLevelfontSize : spacings.fontSize,
    textColor
  );

  window.ctx.save();
  if (parentView) lineBetween(view, parentView);
  window.ctx.restore();
};

const lineBetween = (view1: ItemView, view2: ItemView) => {
  const { circleRadius, lineToCircleDistance } = spacings;

  const x1 =
    view1.gridX * spacings.gridSize - circleRadius - lineToCircleDistance;
  const y1 = view1.gridY * spacings.gridSize;

  const x2 = view2.gridX * spacings.gridSize;
  const y2 =
    view2.gridY * spacings.gridSize + circleRadius + lineToCircleDistance;

  const ctx = window.ctx;
  ctx.lineWidth = spacings.lineWidth;
  ctx.strokeStyle = theme.line;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y1);
  ctx.lineTo(x2, y2);

  ctx.stroke();
};

const roundToHalf = (x: number) => {
  const fraction = x % 1;
  if (fraction < 0.5) {
    return Math.round(x) + 0.5;
  } else {
    return Math.round(x) - 0.5;
  }
};
const roundToWhole = (x: number) => {
  return Math.round(x);
};

// const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
//   const ctx = window.ctx;
//   ctx.lineWidth = spacings.lineWidth;
//   ctx.strokeStyle = theme.line;
//   ctx.lineJoin = "round";
//   ctx.beginPath();
//   ctx.moveTo(x1, y1);
//   ctx.lineTo(x2, y2);

//   ctx.stroke();
// }

// const drawArrow = (x1: number, y1: number, x2: number, y2: number) => {
//   const ctx = window.ctx;
//   ctx.lineWidth = spacings.lineWidth;
//   ctx.strokeStyle = theme.line;
//   ctx.lineJoin = "round";
//   ctx.beginPath();
//   ctx.moveTo(x1, y1);
//   ctx.lineTo(x2, y2);

//   ctx.stroke();
// }

// const drawArrowHead = (x: number, y: number, angle: number) => {
//   const ctx = window.ctx;
//   ctx.lineWidth = spacings.lineWidth;
//   ctx.strokeStyle = theme.line;
//   ctx.lineJoin = "round";
//   ctx.beginPath();
//   ctx.moveTo(x, y);
//   ctx.lineTo(x + Math.cos(angle) * spacings.arrowHeadLength, y + Math.sin(angle) * spacings.arrowHeadLength);
//   ctx.lineTo(x + Math.cos(angle + Math.PI / 3) * spacings.arrowHeadLength, y + Math.sin(angle + Math.PI / 3) * spacings.arrowHeadLength);
//   ctx.lineTo(x + Math.cos(angle - Math.PI / 3) * spacings.arrowHeadLength, y + Math.sin(angle - Math.PI / 3) * spacings.arrowHeadLength);
//   ctx.lineTo(x, y);
