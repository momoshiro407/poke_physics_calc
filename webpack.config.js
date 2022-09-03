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
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { url: false }
          }
        ]
      },
      {
        test: /\.json$/,
        loader: "json-loader",
        type: "javascript/auto"
      },
    ],
  }
};