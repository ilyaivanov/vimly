const circleRadius = 3.5;
export const spacings = {
  titleFontSize: 28,
  firstLevelfontSize: 20,
  fontSize: 16,
  gridSize: 28,

  circleRadius,
  circleLineWidth: 1.5,

  lineWidth: 2,
  offsetFromTop: 60,

  viewportMaxWidth: 800,

  lineToCircleDistance: 10,
  textFromCircleDistance: 13,

  fontFace: "Segoe UI",
};

const themes = {
  dark: {
    bg: "#1E1E1E",
    line: "#373B42",
    titleFont: "#FFFFFF", //"#FFFFFF",
    font: "#CBCBCB", //"#FFFFFF",
    firstLevelFont: "#FFFFFF", //"#FFFFFF",
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
