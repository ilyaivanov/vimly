import { AppState } from "./app";

// Canvas Infra
const VIEWPORT_MAX_WIDTH = 800;
let xOffset = 0;

const fontSize = 16;

let onResizeCb: () => void;

export const setOnResizeCb = (cb: typeof onResizeCb) => (onResizeCb = cb);

export const initCanvas = () => {
  const canvas = document.createElement("canvas");

  document.body.appendChild(canvas);
  VIEWPORT_MAX_WIDTH;
  const assignDimensions = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    xOffset = Math.max(0, (width - VIEWPORT_MAX_WIDTH) / 2);

    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener("resize", () => {
    assignDimensions();
    onResizeCb && onResizeCb();
  });
  assignDimensions();

  const canvasContext = canvas.getContext("2d")!;

  window.ctx = canvasContext;
};

// Canvas Drawings
const fillCircle = (x: number, y: number, r: number, color: string) => {
  window.ctx.fillStyle = color;
  window.ctx.beginPath();
  window.ctx.arc(x + xOffset, y, r, 0, 2 * Math.PI);
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
  window.ctx.arc(x + xOffset, y, r, 0, 2 * Math.PI);
  window.ctx.lineWidth = lineWidth;
  window.ctx.stroke();
};

const fillTextAtMiddle = (
  text: string,
  x: number,
  y: number,
  color: string
) => {
  window.ctx.fillStyle = color;
  window.ctx.textBaseline = "middle";
  window.ctx.font = `${fontSize}px Roboto, sans-serif`;
  window.ctx.fillText(text, x + xOffset, y);
};

declare global {
  interface Window {
    ctx: CanvasRenderingContext2D;
  }
}

// APP

const gridSize = 22;
const textToCircleCenter = 10;
const themes = {
  dark: {
    bg: "#1E1E1E",
    line: "#3C413D",
    font: "#FFFFFF",
    selected: "#B1E847",
    gridPoint: "#3C413D",
    filledCircle: "#D1D2D3",
    centerColor: "#2C392F",
  },
  light: {
    bg: "#FAF9F7",
    line: "#D3D3D3",
    gridPoint: "#D3D3D3",
    selected: "#1D0FFF",
    filledCircle: "#A39E93",
    centerColor: "#EAEAEA",
    font: "#000000",
  },
};

const theme = themes.dark;

export const drawApp = (app: AppState) => {
  window.ctx.fillStyle = theme.bg;
  window.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  const base = 20;
  for (let i = 0; i < app.views.length; i += 1) {
    const view = app.views[i];
    const x = view.gridX * gridSize;
    const y = view.gridY * gridSize + base;
    const color = view.isSelected ? theme.selected : theme.filledCircle;
    const textColor = view.isSelected ? theme.selected : theme.font;

    const textYOffset = 1;
    const textXOffset = textToCircleCenter;

    fillCircle(x, y, 3.2, color);
    outlineCircle(x, y, 3.2, 1.5, color);
    fillTextAtMiddle(
      view.item.title,
      x + textXOffset,
      y + textYOffset,
      textColor
    );
  }
};
