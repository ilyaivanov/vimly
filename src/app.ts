type Item = {
  title: string;
  children: Item[];
  view?: ItemView;
};

type ItemView = {
  gridX: number;
  gridY: number;
  item: Item;
};

export type AppState = { root: Item; views: ItemView[] };

export const createItem = (item: Partial<Item> | string): Item => {
  if (typeof item === "string")
    return {
      title: item,
      children: [],
    };
  else
    return {
      title: "",
      children: [],
      ...item,
    };
};

export const createApp = (items: Item[]): AppState => {
  const root: Item = { title: "Root", children: items };
  const views: ItemView[] = [];

  items.forEach((item, index) => {
    const view = {
      gridX: 0,
      gridY: index,
      item,
    };

    views.push(view);
  });

  return { root, views };
};
