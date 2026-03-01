//╔═════════════════════════════════════════════════════════════════════════════
//║ Griddle HTTP/Web Socket Interface
//╠═════════════════════════════════════════════════════════════════════════════
//║ Provides WS interface for a singluar Griddle Game instance
//╚═════════════════════════════════════════════════════════════════════════════

//╔═════════════════════════════════════════════════════════════════════════════
//║ Imports
//╚═════════════════════════════════════════════════════════════════════════════

import * as uuid from "uuid";
import * as fs from "fs";
import * as path from "path";
import express from "express";
import { Liquid } from "liquidjs";
import expressWs from "express-ws";
import { Game } from "./lib/Griddle/Game.js";
import { fancyConsole as console } from "./lib/console.js";
//╔═════════════════════════════════════════════════════════════════════════════
//║ Welcome Logging
//╚═════════════════════════════════════════════════════════════════════════════

console.topBar();
console.titleBox();

//╔═════════════════════════════════════════════════════════════════════════════
//║ Set up Express
//╚═════════════════════════════════════════════════════════════════════════════

const app = express();
const wsInstance = expressWs(app);
const engine = new Liquid();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("dist"));
app.use("/audio", express.static("audio"));

// register liquid engine
app.engine("liquid", engine.express());
app.set("views", "./views"); // specify the views directory
app.set("view engine", "liquid"); // set liquid to default

//╔═════════════════════════════════════════════════════════════════════════════
//║ Log all incoming requests
//╚═════════════════════════════════════════════════════════════════════════════

app.use((req, res, next) => {
	console.info(`${req.method.toUpperCase()} ${req.url} from ${req.ip}`);
	next();
});

//╔═════════════════════════════════════════════════════════════════════════════
//║ Use the Routes
//╚═════════════════════════════════════════════════════════════════════════════

app.get("/", (req, res, next) => {
	res.render("index");
});

app.get("/api/music", (req, res) => {
	const musicDir = path.resolve("audio/music");
	const files = fs
		.readdirSync(musicDir)
		.filter((f) => f.endsWith(".mp3"))
		.map((f) => ({
			file: `/audio/music/${f}`,
			name: f
				.replace(/-/g, " ")
				.replace(".mp3", "")
				.replace(/\b\w/g, (c) => c.toUpperCase()),
		}));
	res.json(files);
});

app.ws("/:seed", (ws, req) => {
	const seed = req.params.seed || uuid.v4();
	const numColors = Math.min(
		16,
		Math.max(2, parseInt(req.query.colors) || 16),
	);

	const mode = req.query.mode === "unlimited" ? "unlimited" : "limited";
	const validSizes = [9, 15, 21, 25];
	const size = validSizes.includes(parseInt(req.query.size))
		? parseInt(req.query.size)
		: 21;

	const movingOrigin = req.query.origin !== "fixed";

	const Griddle = new Game(seed, numColors, mode, size, movingOrigin);
	let Board = Griddle.startGame();

	// Send the initial board state on connect
	ws.send(JSON.stringify({ type: "board", data: Board }));

	ws.on("message", (raw) => {
		let msg;
		try {
			msg = JSON.parse(raw);
		} catch (e) {
			ws.send(
				JSON.stringify({
					type: "error",
					message: "Invalid JSON",
					format: { c: "<validChar>" },
				}),
			);
			return;
		}

		if (msg.c) {
			const c = msg.c.toUpperCase();
			if (Griddle.game && Griddle.game.characters.includes(c)) {
				Board = Griddle.useTurn(c);
				if (Griddle.gameOver) {
					ws.send(
						JSON.stringify({
							type: "gameover",
							win: !Griddle.lose,
							data: Board,
						}),
					);
				} else {
					ws.send(
						JSON.stringify({
							type: "board",
							data: Board,
							originChanged: Griddle.originChanged || false,
							limitedMoves: Griddle.limitedMoves || false,
						}),
					);
				}
			} else {
				ws.send(
					JSON.stringify({
						type: "error",
						message: "Invalid Input Character",
						validChars: Griddle.characters,
					}),
				);
			}
		} else {
			ws.send(
				JSON.stringify({
					type: "error",
					message: "Input Character [c] required",
					validChars: Griddle.characters,
					format: { c: "<validChar>" },
				}),
			);
		}
	});
});

//╔═════════════════════════════════════════════════════════════════════════════
//║ Handle bad requests
//╚═════════════════════════════════════════════════════════════════════════════

app.use(function onError(err, req, res, next) {
	res.statusCode = 500;
	res.end(res.sentry + "\n");
});

app.use((req, res, next) => {
	res.statusCode = 404;
	console.error(`404 Request to ${req.url} from ${req.ip}`);
	res.send({
		message: `404`,
	});
});

//╔═════════════════════════════════════════════════════════════════════════════
//║ Listen on defined port
//╚═════════════════════════════════════════════════════════════════════════════

try {
	const port = process.env.PORT || 3000;
	app.listen(port, () => {
		console.serviceStatusBox(`Griddle Listening on port`, `${port}`);
	});
} catch (error) {
	console.error(error);
}
