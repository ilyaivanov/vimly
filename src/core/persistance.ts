import { AppState, Item, item } from ".";

const defaultItems: Item[] = [
  item("Viztly 1", [item("Viztly 1.1"), item("Viztly 1.2")]),
  item("Viztly 2"),
];

const USE_LOCAL_STORAGE = true;

export const createApp = (items: Item[]): AppState => {
  const root: Item = item("Root", items);

  const selectedItem = root.children[0];

  const app = { root, views: new Map(), selectedItem, itemFocused: root };

  return app;
};

const types = [
  { description: "Viztly JSON File", accept: { "json/*": [".json"] } },
];

export const saveToFile = async (state: AppState) => {
  if (window.showSaveFilePicker) {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: "viztly.json",
      types,
    });

    const myFile = await fileHandle.createWritable();
    await myFile.write(serialize(state));
    await myFile.close();
  } else {
    throw new Error("Browser doesn't have showSaveFilePicker");
  }
};

export const loadFromFile = async (): Promise<AppState> => {
  if (window.showOpenFilePicker) {
    const [fileHandle] = await window.showOpenFilePicker({ types });

    const fileData = await fileHandle.getFile();
    const t = await fileData.text();
    return parse(t);
  } else {
    throw new Error("Browser doesn't have showSaveFilePicker");
  }
};

export const saveToLocalStorage = (tree: AppState) => {
  localStorage.setItem("viztly:v2", serialize(tree));
};

export const loadFromLocalStorage = (): AppState => {
  if (USE_LOCAL_STORAGE) {
    const serialized = localStorage.getItem("viztly:v2");
    return serialized ? parse(serialized) : createApp(defaultItems);
  } else {
    return createApp(defaultItems);
  }
};

const parse = (serializedTree: string): AppState => {
  const root: Item = JSON.parse(serializedTree);

  const mapItem = (item: Item): Item => {
    const res: Item = item;
    res.children = item.children.map((c) => {
      const item = mapItem(c);
      item.parent = res;
      return item;
    });
    return res;
  };

  const rootParsed = mapItem(root);
  return createApp(rootParsed.children);
};

const serialize = (tree: AppState): string => {
  function replacer(key: keyof Item, value: unknown) {
    if (key == "parent" || key == "view") return undefined;
    else return value;
  }
  return JSON.stringify(tree.root, (key, value) =>
    replacer(key as keyof Item, value)
  );
};
