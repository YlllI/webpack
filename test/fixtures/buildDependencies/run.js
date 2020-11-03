const path = require("path");
const webpack = require("../../..");
// eslint-disable-next-line node/no-missing-require
const value = require("../../js/buildDepsInput/config-dependency");

process.exitCode = 1;

const esm = +process.versions.modules >= 83;

if (esm) {
	import("./esm.mjs").then(module => {
		run(module.default);
	});
} else {
	run(0);
}

const run = value2 => {
	webpack(
		{
			mode: "development",
			context: __dirname,
			entry: "./index",
			output: {
				path: path.resolve(__dirname, "../../js/buildDeps/" + process.argv[2]),
				libraryTarget: "commonjs2"
			},
			plugins: [
				new webpack.DefinePlugin({
					VALUE: JSON.stringify(value),
					VALUE2: JSON.stringify(value2),
					VALUE_UNCACHEABLE: webpack.DefinePlugin.runtimeValue(
						() => JSON.stringify(value),
						true
					)
				})
			],
			cache: {
				type: "filesystem",
				cacheDirectory: path.resolve(__dirname, "../../js/buildDepsCache"),
				buildDependencies: {
					config: [
						// __filename,
						// path.resolve(__dirname, "../../../node_modules/.yarn-integrity")
					].concat(esm ? ["./esm.mjs"] : []),
					defaultWebpack: []
				}
			},
			snapshot: {
				managedPaths: [path.resolve(__dirname, "../../../node_modules")]
			}
		},
		(err, stats) => {
			if (err) {
				return console.log(err);
			}
			if (stats.hasErrors()) {
				return console.log(stats.toString({ all: false, errors: true }));
			}
			process.exitCode = 0;
			console.log("OK");
		}
	);
};
