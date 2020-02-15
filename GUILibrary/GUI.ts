export class Rect {
    public x: number;

    constructor(x: number | { x: number, y: number, width: number, height: number } = 0, public y = 0, public width = 0, public height = 0) {
        if (typeof x == "object") {
            this.x = x.x
            this.y = x.y
            this.width = x.width
            this.height = x.height
        } else this.x = x
    }

    spread(): [number, number, number, number] {
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

    translate(offset: { x: number, y: number } | number, offsetY: number = 0) {
        if (typeof offset == "object") {
            return new Rect(this.x + offset.x, this.y + offset.y, this.width, this.height)
        } else {
            return new Rect(this.x + offset, this.y + offsetY, this.width, this.height)
        }
    }

    copy() {
        return new Rect(this.x, this.y, this.width, this.height)
    }
}

export class Point {
    public x: number;
    constructor(x: number | { x: number, y: number } = 0, public y = 0) {
        if (typeof x == "object") {
            this.x = x.x
            this.y = x.y
        } else this.x = x
    }

    spread(): [number, number] {
        return [this.x, this.y]
    }

    mul(amount: number) {
        return new Point(this.x * amount, this.y * amount)
    }

    add(other: { x: number, y: number } | number, otherY: number = 0) {
        if (typeof other == "object")
            return new Point(this.x + other.x, this.y + other.y)
        else
            return new Point(this.x + other, this.y + otherY)
    }

    copy() {
        return new Point(this.x, this.y)
    }
}

export class GUIControl {
    protected parent: GUIControl = null
    protected children: GUIControl[] = []
    public rect: Rect = new Rect()
    public over = false
    public down = false
    public delta = new Point()

    remove() {
        if (this.parent)
            this.parent.children.splice(this.parent.children.indexOf(this), 1)
    }

    getScreenRect(offset: Point) : Rect {
        return this.rect.translate(offset).translate(this.parent ? this.parent.getScreenRect(new Point()) : 0, 0)
    }

    append(control: GUIControl) {
        control.remove()
        control.parent = this
        this.children.push(control)
    }

    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "white"
        ctx.strokeRect(...this.getScreenRect(offset).spread())
    }

    getParent() { return this.parent }
    getChildren() { return this.children }
}

export class CanvasGUI {
    protected ctx: CanvasRenderingContext2D
    public offset: Point = new Point()
    public centerCoords: boolean = false
    protected root: GUIControl = new GUIControl()

    constructor(public canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d", { alpha: true })
    }

    update() {
        var size = new Rect(this.canvas.getBoundingClientRect()).origin()
        this.canvas.width = size.width
        this.canvas.height = size.height

        var currOffset = this.offset.copy()
        if (this.centerCoords) currOffset = currOffset.add(size.mul(0.5).end())

        this.drawControl(this.root, currOffset)
    }

    drawControl(control: GUIControl, offset: Point) {
        control.draw(offset, this.ctx)
        control.getChildren().forEach(v => this.drawControl(v, offset))
    }

    addControl(control: GUIControl) {
        this.root.append(control)
    }
}