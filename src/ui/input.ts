import { AppState, Item, spacings, theme } from "../core";
import { setFont, xOffset } from "./canvas";

export let itemEdited: Item | undefined = undefined;
export type CarretPosition = "start" | "end";
export const showInput = (app: AppState, position: CarretPosition) => {
  if (app.selectedItem) {
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("text-input");
    const view = app.views.get(app.selectedItem);

    if (view) {
      const x = view.x + xOffset + spacings.textFromCircleDistance - 2;

      setFont(view.fontSize);
      const height = window.ctx.measureText(
        view.item.title
      ).fontBoundingBoxAscent;

      const y = view.y + spacings.offsetFromTop - height;

      Object.assign(input.style, {
        top: y + "px",
        left: x + "px",
        color: theme.selected,
        fontSize: view.fontSize + "px",
        fontFamily: spacings.fontFace,
        overflow: "hidden",
        width: "600px",
      });

      document.body.appendChild(input);

      input.value = app.selectedItem.title;
      itemEdited = app.selectedItem;
      input.focus();
      placeCarretAtStart(input, position);

      const finishEdit = () => {
        if (app.selectedItem) app.selectedItem.title = input.value;
        input.remove();

        itemEdited = undefined;
      };

      //TODO: on blur render is not being called, thus title remains empty
      input.addEventListener("blur", finishEdit);

      input.addEventListener("keydown", (e) => {
        if (e.code === "Enter" || e.code === "Escape") {
          input.removeEventListener("blur", finishEdit);
          finishEdit();
        }
      });
    }
  }
};

// export const hideInput = () => {

// }

const placeCarretAtStart = (
  input: HTMLInputElement,
  position: CarretPosition
) => {
  if (position == "start") {
    input.scrollTo({ left: 0 });
    input.setSelectionRange(0, 0);
  }
};
