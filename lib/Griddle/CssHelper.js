//====================================================================
// 
//
//	CSS Helper
//
//
//====================================================================

class CssHelper {
	constructor(){}
	getClass( character, row, col, origin, a ){
		let borderCharacter = 'X';

		if( character == borderCharacter ){
			if( row == 0 && col == origin.y ){
				return 'griddleBlock griddleBorder down';
			} else if( row == origin.x && col == 0 ){
				return 'griddleBlock griddleBorder right';
			} else if( row == a.length - 1 && col == origin.y ){
				return 'griddleBlock griddleBorder up';
			} else if( row == origin.x && col == a[0].length - 1 ){
				return 'griddleBlock griddleBorder left';
			} else {
				return 'griddleBlock griddleBorder';
			}
		} else {
			let returnClass = 'griddleBlock';

			let up = 	this.letters[row-1][col];
			let down = 	this.letters[row+1][col];
			let left = 	this.letters[row][col-1];
			let right =	this.letters[row][col+1];

			if( up != character ){
				returnClass += ' blockBorderTop';
			}
			
			if( down != character ){
				returnClass += ' blockBorderBottom';
			}

			if( left != character ){
				returnClass += ' blockBorderLeft';
			}

			if( right != character ){
				returnClass += ' blockBorderRight';
			}


			return returnClass;
		}
	}
	getCharacterClass( r, c, origin ){
		if( r == origin.x && c == origin.y ){
			return '';
			// return 'pulseit';
		} else {
			return '';
		}
	}
	isOrigin( r, c, origin ){
		if( r == origin.x && c == origin.y ){
			return true;
		} else {
			return false;
		}
	}
	getStyle( row, col, bgColors, origin ){
		let bgColor = bgColors[row][col];

		if( row == 0 && col == origin.y ){
			return '';
		} else if( row == origin.x && col == 0 ){
			return '';
		} else if( row == bgColors.length - 1 && col == origin.y ){
			return '';
		} else if( row == origin.x && col == bgColors[0].length - 1 ){
			return '';
		} else {
			return `background-color: ${bgColor};`;
		}

	}
	getCharacter( character ){
		if( character == 'X' ){
			return '';
		} else {
			return character;
		}
	}
}

export { 
	CssHelper
}