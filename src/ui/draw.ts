import { AppState, hasChildren, ItemView } from "../core/app";
import { fillCircle, fillTextAtMiddle, outlineCircle, xOffset } from "./canvas";
import { itemEdited } from "./input";
import { spacings, theme } from "./ui";

export const drawApp = (app: AppState) => {
  window.ctx.fillStyle = theme.bg;
  window.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  window.ctx.translate(xOffset, spacings.offsetFromTop);

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
  const x = view.x;
  const y = view.y;
  const color = view.isSelected ? theme.selected : theme.filledCircle;

  const isFirstLevel = view.item.parent == app.itemFocused;

  const isItemFocused = view.item == app.itemFocused;

  const textColor = view.isSelected
    ? theme.selected
    : isFirstLevel || isItemFocused
    ? theme.firstLevelFont
    : theme.font;

  const textYOffset = 1;
  const textXOffset = spacings.textFromCircleDistance;

  if (!isItemFocused) {
    if (hasChildren(view.item)) fillCircle(x, y, spacings.circleRadius, color);

    outlineCircle(x, y, spacings.circleRadius, spacings.circleLineWidth, color);
  }

  if (view.item !== itemEdited) {
    const fontSize = isItemFocused
      ? spacings.titleFontSize
      : isFirstLevel
      ? spacings.firstLevelfontSize
      : spacings.fontSize;

    fillTextAtMiddle(
      view.item.title,
      x + textXOffset,
      y + textYOffset,
      fontSize,
      textColor
    );
  }

  window.ctx.save();
  if (parentView && !isItemFocused) lineBetween(view, parentView);
  window.ctx.restore();
};

const lineBetween = (view1: ItemView, view2: ItemView) => {
  const { circleRadius, lineToCircleDistance } = spacings;

  const x1 = view1.x - circleRadius - lineToCircleDistance;
  const y1 = view1.y;

  const x2 = view2.x;
  const y2 = view2.y + circleRadius + lineToCircleDistance;

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
