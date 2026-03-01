//====================================================================
//
//
//	Game
//
//
//====================================================================

import { Grid } from "./Grid.js";

class Game {
	constructor(seed, numColors, mode, size, movingOrigin) {
		this.started = false;
		this.sizes = [[20, 20]];
		this.levels = [...Array(20).keys()];
		this.boardSize = 0;
		this.currentLevel = 0;
		this.gameSeed = seed || false;
		this.numColors = numColors || 16;
		this.mode = mode || "limited";
		this.size = size || 21;
		this.movingOrigin = movingOrigin !== undefined ? movingOrigin : true;
		this.game = false;
		this.board = false;
		this.seed = 0;
		this.turns = 0;
		this.usedTurns = 0;
		this.characters = [];
		this.charColors = [];
		this.gameOver = false;
		this.lose = null;
		this.currentMusicTrack = null;
		return this;
	}
	raiseEvent(eventName, eventDetails = {}) {
		new CustomEvent(eventName, eventDetails);
	}
	startGame(level) {
		this.started = true;
		this.currentLevel = level;
		this.raiseEvent("newGameStarted");
		return this.newGame(level);
	}
	newGame(level = 0) {
		let boardSize = this.sizes[this.boardSize];

		let sliceNum = 0;
		if (level < 3) {
			sliceNum = 3;
		} else {
			sliceNum = level;
		}

		this.game = new Grid({
			rows: this.size,
			cols: this.size,
			numColors: this.numColors,
			mode: this.mode,
			movingOrigin: this.movingOrigin,
		});

		let board = this.game.generate(this.gameSeed);
		this.board = board;
		this.seed = board.seed;
		this.blocks = board.blocks;
		this.turns = board.turns;
		this.characters = board.characters;
		this.charColors = board.charColors;

		return this.boardDetails(board);
	}
	boardDetails(board) {
		return {
			Origin: board.origin,
			Blocks: board.blocks,
			Letters: board.letters,
			BgColors: board.bgColors,
			Turns: {
				Used: board.usedTurns,
				Remaining: board.turns,
			},
		};
	}
	useTurn(input) {
		this.raiseEvent("useTurnStart");
		let board = this.game.turn(input);
		this.usedTurns++;

		if (board == 1 || board == -1) {
			return this._winOrLose(board);
		} else {
			return this._continueGame(board);
		}
	}
	_winOrLose(board) {
		this.gameOver = true;
		if (board == 1) {
			this.lose = false;
			this.gameSeed = false;
			this.raiseEvent("levelComplete", { level: this.currentLevel });
		} else {
			this.lose = true;
			this.raiseEvent("gameOver", { level: this.currentLevel });
		}
		this.raiseEvent("useTurnEnd", { turn: this.usedTurns });
		return this.boardDetails(this.game._export());
	}
	_continueGame(board) {
		this.originChanged = false;
		this.limitedMoves = false;
		if (
			this.movingOrigin &&
			board.usedTurns > 0 &&
			board.usedTurns % 5 == 0
		) {
			let oldX = this.game.originX;
			let oldY = this.game.originY;
			this.game.setRandomOrigin();
			board = this.game._export();
			this.originChanged = true;
			this.raiseEvent("originChange", {
				oldOrigin: {
					x: oldX,
					y: oldY,
				},
				newOrigin: {
					x: this.game.originX,
					y: this.game.originY,
				},
			});
		}
		this.gameOver = false;
		this.lose = null;
		this.seed = board.seed;
		this.turns = board.turns;
		this.characters = board.characters;
		this.charColors = board.charColors;

		if (this.turns == 5) {
			this.limitedMoves = true;
			this.raiseEvent("limitedMoves");
		}

		this.raiseEvent("useTurnEnd", { turn: this.usedTurns });
		return this.boardDetails(board);
	}
}

export { Game };
