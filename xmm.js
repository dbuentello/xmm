#!/usr/bin/env node

function ask(tx)
{
	const rl = require("readline").createInterface({
		input: process.stdin,
		output: process.stdout
	});

	console.info(tx.hash);
	console.info(JSON.parse(tx.json));

	return new Promise(resolve => {
		const expected = "submit";
		const query = `Type "${expected}" to confirm: `;

		rl.question(query, answer => {
			rl.close();
			resolve(expected == answer);
		});
	});
}

global.connect = callback => config => {
	if (!config.yes)
		config.yes = ask;

	callback = callback.bind(null, config);
	require(".").connect(config).then(callback).catch(abort);
};

global.abort = (msg, error) => {
	if (error)
		console.error(error);
	else
		console.error(msg);

	process.exit(1);
};

const getobj = x => ("string" == typeof x) ? JSON.parse(x) : x;
const opts = {
	assets: {
		coerce: getobj,
		describe: "Dictionary of assets",
		default: {},
		global: true
	},
	count: {
		alias: "n",
		describe: "Number of ledgers to close",
		default: 1,
		global: true
	},
	cushion: {
		alias: "f",
		describe: "Factor to multiply estimated fee",
		default: 1,
		global: true
	},
	delta: {
		alias: "d",
		describe: "Stake to trade",
		default: 0.01,
		global: true
	},
	ledger: {
		alias: "l",
		describe: "Historical ledger version",
		number: true,
		global: true
	},
	maxfee: {
		alias: "m",
		describe: "The maximum fee to pay",
		default: 1e-5,
		global: true
	},
	offset: {
		alias: "o",
		describe: "Offset from the current legder",
		default: 3,
		global: true
	},
	server: {
		alias: "s",
		describe: "WebSocket server",
		default: "wss://s1.ripple.com",
		global: true
	},
	timeout: {
		alias: "t",
		describe: "Timeout in seconds for requests",
		default: 10,
		global: true
	},
	wallets: {
		coerce: getobj,
		describe: "Dictionary of wallets",
		default: {},
		global: true
	},
	yes: {
		alias: "y",
		describe: "Do not ask for confirmation",
		boolean: true,
		global: true
	}
};

const home = require("os").homedir();
const conf = require("path").join(home, ".xmm.json");

function load(path)
{
	try {
		const read = require("fs").readFileSync;
		const json = read(path, "utf-8");
		const dict = JSON.parse(json);

		return dict;
	} catch (error) {
		console.warn("%s: Could not load configuration", path);

		return {};
	}
}

require("yargs")
	.usage("Usage: $0 [options] <command> [arguments]")
	.options(opts)
	.config("config", load)
	.alias("config", "c")
	.global("config")
	.default("config", conf, "~/.xmm.json")
	.command(require("./altnet"))
	.command(require("./balance"))
	.command(require("./cost"))
	.command(require("./generate"))
	.command(require("./ledger"))
	.command(require("./offer"))
	.command(require("./send"))
	.command(require("./trust"))
	.command(require("./what"))
	.demand(1)
	.strict()
	.recommendCommands()
	.version()
	.alias("version", "v")
	.help()
	.alias("help", "h")
	.wrap(70)
	.fail(abort)
	.argv;
