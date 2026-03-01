//====================================================================
//
//
//	Grid
//
//
//====================================================================

import { Random, createEntropy, MersenneTwister19937 } from "random-js";
import { Block } from "./Block.js";

class Grid {
	constructor(options) {
		let rows = options.rows || 10;
		let cols = options.cols || 10;

		this.crows = rows;
		this.ccols = cols;
		this.numBlocks = rows * cols;
		this.mode = options.mode || "limited";
		this.movingOrigin =
			options.movingOrigin !== undefined ? options.movingOrigin : true;
		this.characters = [];
		this.charColors = [];

		this.maxX = 0;
		this.maxY = 0;

		this.hypontenuse = Math.ceil(
			Math.sqrt(Math.pow(rows, 2) + Math.pow(cols, 2)),
		);

		this.blocks = [];
		this.originBlock = null;
		this.originX = null;
		this.originY = null;

		if (options.characters && options.characters.length) {
			options.characters.forEach((element) => {
				this.characters.push(element[0]);
				this.charColors.push(element[1]);
			});
		} else {
			this.characters = [
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"A",
				"B",
				"C",
				"D",
				"E",
				"F",
			];
			this.charColors = [
				"#E6194B",
				"#3CB44B",
				"#4363D8",
				"#F58231",
				"#911EB4",
				"#42D4F4",
				"#F032E6",
				"#BFEF45",
				"#FABED4",
				"#469990",
				"#FFE119",
				"#9A6324",
				"#800000",
				"#AAFFC3",
				"#808000",
				"#000075",
			];
		}

		if (options.numColors && options.numColors < this.characters.length) {
			this.characters = this.characters.slice(0, options.numColors);
			this.charColors = this.charColors.slice(0, options.numColors);
		}
	}
	setCharacters(characters) {
		this.characters = characters;
	}
	setCharColors(colors) {
		if (colors.length == 6) {
			this.charColors = colors;
		}
	}
	generate(seed = false) {
		if (!seed) {
			let entropy = createEntropy();
			this.boardSeed = Math.abs(entropy[0]);
		} else {
			this.boardSeed = seed;
		}

		this.makeBoardFromSeed();

		this.maxX = this.crows - 1;
		this.maxY = this.ccols - 1;

		for (var x = 0; x < this.crows; x++) {
			this.blocks[x] = Array(this.ccols);
		}

		for (var x = 0; x < this.crows; x++) {
			for (var y = 0; y < this.ccols; y++) {
				var b = new Block(x, y);
				let char = this.boardArray.shift();
				b.setValue(char, this.getColorFromValue(char));
				this.blocks[x][y] = b;
			}
		}

		this.resetTurns();
		this.setRandomOrigin();

		return this._export();
	}
	setRandomOrigin() {
		if (this.movingOrigin) {
			this.originX = this.randomPointOnAxis(0, this.maxX);
			this.originY = this.randomPointOnAxis(0, this.maxY);
		} else {
			this.originX = 0;
			this.originY = 0;
		}
		this.originBlock = this.blocks[this.originX][this.originY];
	}
	unverifyBlocks() {
		for (var x = 0; x < this.crows; x++) {
			for (var y = 0; y < this.ccols; y++) {
				this.blocks[x][y].unverify();
			}
		}
	}
	updateGrid() {
		this.maxX = this.crows - 1;
		this.maxY = this.ccols - 1;

		for (var x = 0; x < this.crows; x++) {
			for (var y = 0; y < this.ccols; y++) {
				this.blocks[x][y].setBgColor(
					this.getColorFromValue(this.blocks[x][y].getValue()),
				);
			}
		}

		return this.blocks;
	}
	getColorFromValue(char) {
		let colorIndex = this.characters.indexOf(char);
		return this.charColors[colorIndex];
	}
	resetTurns() {
		this.usedTurns = 0;
		if (this.mode === "unlimited") {
			this.turns = Infinity;
		} else {
			this.turns = Math.ceil(this.characters.length * 7);
		}
	}
	useTurn() {
		++this.usedTurns;
		if (this.mode !== "unlimited") {
			--this.turns;
		}
	}
	hasTurns() {
		return this.turns > 0;
	}
	getUsedTurns() {
		return this.usedTurns;
	}
	validateInput(input) {
		if (input == "+5") {
			this.turns += 5;
		}
		if (input == "-1") {
			this.turns -= 1;
		}
		if (input == "GOD") {
			this.turns = 9999;
		}
		return this.characters.includes(input);
	}
	makeBoardFromSeed() {
		const mt = MersenneTwister19937.seed(this.boardSeed);
		const random = new Random(mt);
		this.boardArray = [];

		for (let i = 0; i < this.numBlocks; i++) {
			let value = random.integer(0, this.characters.length - 1);
			this.boardArray.push(this.characters[value]);
			mt.next();
		}
	}
	hasWon() {
		let winningChar = this.originBlock.getValue();
		let hasWon = true;

		for (var x = 0; x < this.crows; x++) {
			for (var y = 0; y < this.ccols; y++) {
				if (winningChar != this.blocks[x][y].getValue()) {
					hasWon = false;
				}
			}
		}
		return hasWon;
	}
	paint(newCharacter) {
		const original = this.originBlock.getValue();
		if (original === newCharacter) return;

		const queue = [[this.originBlock.getX(), this.originBlock.getY()]];
		this.unverifyBlocks();

		while (queue.length > 0) {
			const [x, y] = queue.shift();
			if (x < 0 || x >= this.crows || y < 0 || y >= this.ccols) continue;

			const block = this.blocks[x][y];
			if (block.isVerified()) continue;
			if (block.getValue() !== original) continue;

			block.setValue(newCharacter, this.getColorFromValue(newCharacter));
			block.verify();

			queue.push([x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]);
		}
	}

	turn(response) {
		response = response.toUpperCase();

		if (this.hasTurns()) {
			this.unverifyBlocks();

			// console.log('Board: ' + this.boardSeed);
			// console.log(this.turns + ' turns remaining');
			// let response = prompt('Enter Character: ' + JSON.stringify(this.characters) + ' :');

			if (this.validateInput(response)) {
				this.paint(response);
				this.useTurn();
			}

			if (this.hasWon()) {
				this.updateGrid();
				return 1; //WIN
			} else {
				return this._export(); //GAME ON
			}
		} else {
			return -1; //LOSE
		}
	}
	_export() {
		let letters = Array(this.crows);
		let bgColors = Array(this.crows);

		for (var x = 0; x < this.crows; x++) {
			letters[x] = Array(this.ccols);
			bgColors[x] = Array(this.ccols);
		}

		for (var x = 0; x < this.crows; x++) {
			for (var y = 0; y < this.ccols; y++) {
				var b = this.blocks[x][y];
				letters[x][y] = b.getValue();
				bgColors[x][y] = b.getBgColor();
			}
		}

		return {
			self: this,
			blocks: this.blocks,
			seed: this.boardSeed,
			usedTurns: this.usedTurns,
			turns: this.turns,
			origin: {
				x: this.originBlock.getX(),
				y: this.originBlock.getY(),
			},
			characters: this.characters,
			charColors: this.charColors,
			charactersBonus: this.charactersBonus,
			charBonusColors: this.charBonusColors,
			letters,
			bgColors,
		};
	}
	randomPointOnAxis(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
}

export { Grid };
