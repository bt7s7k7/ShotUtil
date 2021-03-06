export class Rect {
    size() {
        return new Point(this.width, this.height)
    }

    pos() {
        return new Point(this.x, this.y)
    }

    makePixelPerfect(): Rect {
        return new Rect(Math.floor(this.x) + 0.5, Math.floor(this.y) + 0.5, Math.floor(this.width), Math.floor(this.height))
    }
    public x: number;
    public y: number

    constructor(x: number | { x: number, y: number } | { x: number, y: number, width: number, height: number } = 0, y: number | { x: number, y: number } = 0, public width = 0, public height = 0) {
        if (typeof x == "object") {
            this.x = x.x
            this.y = x.y
            if ('width' in x) {
                this.width = x.width
                this.height = x.height
            } else {
                if (typeof y == "object") {
                    this.width = y.x
                    this.height = y.y
                } else {
                    this.width = y
                    this.height = width
                }
            }
        } else {
            this.x = x
            if (typeof y == "number") {
                this.y = y
            } else {
                throw new TypeError("y can only be an object if x is point")
            }
        }
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

    expand(offset: { x: number, y: number } | number, offsetY: number = 0) {
        if (typeof offset == "object") {
            return new Rect(this.x, this.y, this.width + offset.x, this.height + offset.y)
        } else {
            return new Rect(this.x, this.y, this.width + offset, this.height + offsetY)
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
    normalize() {
        return this.mul(1 / Math.hypot(this.x, this.y))
    }

    toAngle() {
        return Math.atan2(this.x, this.y)
    }

    scale(other: { x: number, y: number } | number, otherY: number = 0) {
        if (typeof other == "object")
            return new Point(this.x * other.x, this.y * other.y)
        else
            return new Point(this.x * other, this.y * otherY)
    }
    public x: number;
    constructor(x: number | { x: number, y: number } = 0, public y = 0) {
        if (typeof x == "object") {
            this.x = x.x
            this.y = x.y
        } else this.x = x
    }

    static fromAngle(angle: number) {
        return new Point(Math.sin(angle), Math.cos(angle))
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
    down: ButtonState;
    delta: Point;
    pos: Point;
    click: ButtonState;
}

export class GUIControl {
    protected parent: GUIControl = null
    protected children: GUIControl[] = []
    public rect: Rect = new Rect()
    public mouseState: IControlMouseState = { click: defaultButtonsState(), delta: new Point(), down: defaultButtonsState(), over: false, pos: new Point() }
    public enabled = true

    remove() {
        if (this.parent)
            this.parent.children.splice(this.parent.children.indexOf(this), 1)
    }

    getScreenRect(offset: Point): Rect {
        return this.rect.translate(offset).translate(this.parent ? this.parent.getScreenRect(new Point()) : 0, 0).makePixelPerfect()
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

    toBack() {
        if (!this.parent) return;
        this.parent.children.splice(this.parent.children.indexOf(this), 1)
        this.parent.children.splice(0, 0, this)
    }
    toFront() {
        if (!this.parent) return;
        this.parent.children.splice(this.parent.children.indexOf(this), 1)
        this.parent.children.push(this)
    }
}

export type ButtonState = [boolean, boolean, boolean, boolean, boolean]
export function defaultButtonsState() { return [false, false, false, false, false] as ButtonState }

export class CanvasGUI {
    public offset: Point = new Point()
    public centerCoords: boolean = false
    protected root: GUIControl = new GUIControl()
    protected mouseDown = defaultButtonsState()
    protected wasMouseDown = defaultButtonsState()
    protected mousePos = new Point()
    protected lastMousePos = new Point()
    protected selectedControl: GUIControl | "bg" = null

    getMousePos() { return this.mousePos }

    registerListeners(target: HTMLElement) {
        target.addEventListener("mousedown", (event) => {
            this.mouseDown[event.button] = true
        })
        target.addEventListener("mouseup", (event) => {
            this.mouseDown[event.button] = false
        })
        target.addEventListener("mousemove", (event) => {
            this.mousePos = new Point(event.x, event.y)
        })
    }

    getControls() {
        return this.root.getChildren()
    }

    onBackgroundMouse(state: IControlMouseState) {
        // To override
    }

    update(ctx: CanvasRenderingContext2D) {
        var canvas = ctx.canvas
        var size = new Rect(0, 0, canvas.width, canvas.height)

        var currOffset = this.offset.copy()
        if (this.centerCoords) currOffset = currOffset.add(size.mul(0.5).end())

        var handled = false

        this.visitControlsReverse(this.root, control => {
            var over = false
            var down = defaultButtonsState()
            var delta = new Point()
            var click = defaultButtonsState()

            if (!handled) {
                over = this.selectedControl == control || (this.selectedControl == null && control.getScreenRect(currOffset).isPointInside(this.mousePos))
                down = this.mouseDown.map(v => v && over) as ButtonState
                if (over) delta = this.mousePos.add(this.lastMousePos.mul(-1))
                click = down.map((v, i) => v && !this.wasMouseDown[i]) as ButtonState
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

        {
            let over = false
            let down = defaultButtonsState()
            let delta = new Point()
            let click = defaultButtonsState()

            if (!handled) {
                over = this.selectedControl == "bg" || this.selectedControl == null
                down = this.mouseDown.map(v => v && over) as ButtonState
                if (over) delta = this.mousePos.add(this.lastMousePos.mul(-1))
                click = down.map((v, i) => v && !this.wasMouseDown[i]) as ButtonState
            }

            this.onBackgroundMouse({
                over,
                down,
                delta,
                pos: this.mousePos,
                click
            })

            if (over) {
                if (this.selectedControl == null) this.selectedControl = "bg"

                handled = true
            }
        }


        this.lastMousePos = this.mousePos
        this.wasMouseDown = [...this.mouseDown] as ButtonState
        if (!this.mouseDown[0]) this.selectedControl = null

        return currOffset
    }

    draw(ctx: CanvasRenderingContext2D, currOffset: Point) {
        var canvas = ctx.canvas
        var size = new Rect(0, 0, canvas.width, canvas.height)
        this.visitControls(this.root, v => v.draw(currOffset, ctx))
    }

    visitControls(control: GUIControl, callback: (control: GUIControl) => void) {
        if (!control.enabled) return
        callback(control)

        control.getChildren().forEach(v => this.visitControls(v, callback))
    }

    visitControlsReverse(control: GUIControl, callback: (control: GUIControl) => void) {
        if (!control.enabled) return
        control.getChildren().slice().reverse().forEach(v => this.visitControlsReverse(v, callback))

        callback(control)
    }

    addControl(control: GUIControl) {
        this.root.append(control)
    }
}