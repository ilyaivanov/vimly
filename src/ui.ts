const circleRadius = 3.5;
export const spacings = {
  fontSize: 18,
  gridSize: 28,

  circleRadius,
  circleLineWidth: 1.5,

  lineWidth: 3,
  offsetFromTop: 60,

  viewportMaxWidth: 800,

  lineToCircleDistance: 10,
  textFromCircleDistance: 13,

  fontFace: "Segoe UI",
};

export const colors = {
  line: "red",
  circle: "blue",
  text: "green",
};

const themes = {
  dark: {
    bg: "#1E1E1E",
    line: "#3C413D",
    font: "#FFFFFF",
    selected: "#B1E847",
    gridPoint: "#3C413D",
    filledCircle: "#D1D2D3",
    centerColor: "#2C392F", // #2C392F
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

export const theme = themes.dark;
