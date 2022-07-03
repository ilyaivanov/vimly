const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";
  return {
    devtool: isProd ? undefined : "inline-source-map",
    entry: "./src/main.ts",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "app.[chunkhash].js",
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true,
              configFile: "tsconfig.webpack.json",
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "public/index.html",
      }),
      new CopyPlugin({
        patterns: [{ from: "./public/favicon.svg", to: "./favicon.svg" }],
      }),
      isProd ? new CleanWebpackPlugin() : undefined,
    ].filter((x) => x),
  };
};
