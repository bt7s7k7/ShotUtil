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

    isPointInside(point: Point) {
        return point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height
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

export interface IControlMouseState {
    over: boolean;
    down: boolean;
    delta: Point;
    pos: Point;
    click: boolean;
}

export class GUIControl {
    protected parent: GUIControl = null
    protected children: GUIControl[] = []
    public rect: Rect = new Rect()
    public mouseState: IControlMouseState = { click: false, delta: new Point(), down: false, over: false, pos: new Point() }

    remove() {
        if (this.parent)
            this.parent.children.splice(this.parent.children.indexOf(this), 1)
    }

    getScreenRect(offset: Point): Rect {
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

    setMouseState(state: IControlMouseState) {
        this.mouseState = state
        return true
    }

    getParent() { return this.parent }
    getChildren() { return this.children }
}

export class CanvasGUI {
    protected ctx: CanvasRenderingContext2D
    public offset: Point = new Point()
    public centerCoords: boolean = false
    protected root: GUIControl = new GUIControl()
    protected mouseDown = false
    protected wasMouseDown = false
    protected mousePos = new Point()
    protected lastMousePos = new Point()
    protected selectedControl: GUIControl = null

    constructor(protected canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d", { alpha: true })

        canvas.addEventListener("mousedown", () => {
            this.mouseDown = true
        })
        canvas.addEventListener("mouseup", () => {
            this.mouseDown = false
        })
        canvas.addEventListener("mousemove", (event) => {
            this.mousePos = new Point(event.x, event.y)
        })
    }

    update() {
        var size = new Rect(this.canvas.getBoundingClientRect()).origin()
        this.canvas.width = size.width
        this.canvas.height = size.height

        var currOffset = this.offset.copy()
        if (this.centerCoords) currOffset = currOffset.add(size.mul(0.5).end())

        var handled = false

        this.visitControlsReverse(this.root, control => {
            var over = false
            var down = false
            var delta = new Point()
            var click = false

            if (!handled) {
                over = this.selectedControl == control || (this.selectedControl == null && control.getScreenRect(currOffset).isPointInside(this.mousePos))
                down = over && this.mouseDown
                if (over) delta = this.mousePos.add(this.lastMousePos.mul(-1))
                click = down && !this.wasMouseDown
            }

            var hit = control.setMouseState({
                over,
                down,
                delta,
                pos: this.mousePos,
                click
            })

            if (over && hit) {
                if (this.selectedControl == null) this.selectedControl = control

                handled = true
            }
        })

        this.visitControls(this.root, v => v.draw(currOffset, this.ctx))

        this.lastMousePos = this.mousePos
        this.wasMouseDown = this.mouseDown
        if (!this.mouseDown) this.selectedControl = null
    }

    visitControls(control: GUIControl, callback: (control: GUIControl) => void) {
        callback(control)

        control.getChildren().forEach(v => this.visitControls(v, callback))
    }

    visitControlsReverse(control: GUIControl, callback: (control: GUIControl) => void) {
        control.getChildren().slice().reverse().forEach(v => this.visitControls(v, callback))

        callback(control)
    }

    addControl(control: GUIControl) {
        this.root.append(control)
    }
}