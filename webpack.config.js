module.exports = {
  entry: `./src/index.js`,

  output: {
    path: `${__dirname}/docs`,
    filename: "main.js"
  },
  mode: "development",
  devServer: {
    static: "docs",
    open: true
  },
};