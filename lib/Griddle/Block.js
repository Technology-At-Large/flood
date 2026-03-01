//====================================================================
//
//
//	Block
//
//
//====================================================================

class Block {
	constructor(x = 0, y = 0) {
		this.cx = x;
		this.cy = y;
		this.value = null;
		this.bgColor = "";
		this.verified = false;
		this.touched = false;
		this.up = {
			x: this.cx,
			y: this.cy - 1,
		};
		this.left = {
			x: this.cx - 1,
			y: this.cy,
		};
		this.right = {
			x: this.cx + 1,
			y: this.cy,
		};
		this.down = {
			x: this.cx,
			y: this.cy + 1,
		};
	}
	getX() {
		return this.cx;
	}
	getY() {
		return this.cy;
	}
	isValue(value) {
		return this.value == value;
	}
	setValue(value, color) {
		this.value = value;
		this.setBgColor(color);
	}
	getValue() {
		return this.value;
	}
	setBgColor(bgColor) {
		this.bgColor = bgColor;
	}
	getBgColor() {
		return this.bgColor;
	}
	verify() {
		this.verified = true;
	}
	unverify() {
		this.verified = false;
	}
	isVerified() {
		return this.verified == true;
	}
	display() {
		return this.value;
	}
}

export { Block };
