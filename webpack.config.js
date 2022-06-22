const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");

const Path = require("path");
const Package = require("./package.json");

module.exports = {
    entry: "./source/main.ts",
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
                { from: "css", to: "css" },
                { from: "data", to: "data" },
                { from: "images/*.png", to: "./" },
            ],
        }),
        new HtmlWebpackPlugin({
            template: "./index.html",
        }),
        new CircularDependencyPlugin({
            include: /source/,
        }),
    ],
};
