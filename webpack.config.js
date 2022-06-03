const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Path = require("path");
const Package = require("./package.json");

module.exports = {
    entry: "./source/main.js",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: Path.resolve(
            __dirname,
            "release",
            `${Package.name} ${Package.version}`
        ),
        clean: true,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "libraries", to: "libraries" },
                { from: "source/**/*.js", to: "./" },
                { from: "css", to: "css" },
                { from: "maps", to: "maps" },
                { from: "images/*.png", to: "./" },
            ],
        }),
        new HtmlWebpackPlugin({
            template: "./index.html",
        }),
    ],
};
