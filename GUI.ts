export class Rect {
    public x : number;

    constructor(x: number | { x: number, y: number, width: number, height: number } = 0, public y = 0, public width = 0, public height = 0) {
        if (typeof x == "object") {
            this.x = x.x
            this.y = x.y
            this.width = x.width
            this.height = x.height
        } else this.x = 0
    }

    spread() {
        return [this.x, this.y, this.width, this.height]
    }

    origin() {
        return new Rect(0, 0, this.width, this.height)
    }

    mul(amount: number) {
        return new Rect(this.x, this.y, this.width * amount, this.height * amount)
    }

    end() {
        return new Point(this.x + this.width, this.y + this.height)
    }

    translate(offset : Point | number, offsetY : number = 0) {
        if (typeof offset == "object") {
            return new Rect(this.x + offset.x, this.y + offset.y, this.width, this.height)
        } else {
            return new Rect(this.x + offset, this.y + offsetY, this.width, this.height)
        }
    }
}

export class Point {
    public x : number;
    constructor(x: number | { x: number, y: number } = 0, public y = 0) {
        if (typeof x == "object") {
            this.x = x.x
            this.y = x.y
        } else this.x = x
    }

    spread() {
        return [this.x, this.y]
    }

    mul(amount: number) {
        return new Rect(this.x * amount, this.y * amount)
    }
}

export class CanvasGUI {
    public ctx: CanvasRenderingContext2D

    constructor(public canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d", { alpha: true })
    }

    update() {
        var size = new Rect(this.canvas.getBoundingClientRect()).origin()
        this.canvas.width = size.width
        this.canvas.height = size.height

        var offset = size.mul(0.5).end()
    }
}