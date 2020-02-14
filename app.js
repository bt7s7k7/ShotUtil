/** @type {HTMLCanvasElement} */
var canvas = document.getElementById("canvas")

/** 
 * @typedef {{x : number, y : number, width : number, height : number}} Rect 
 * @typedef {{x : number, y : number}} Point
 * */

var newRect = (x = 0, y = 0, width = 0, height = 0) => ({ x, y, width, height })
/** @param {Rect} rect */
var getRectEnd = (rect) => ({ x: rect.x + rect.width, y: rect.y + rect.height })
/** @param {Rect} rect */
var copyRect = (rect) => Object.assign({}, rect);
/** @param {Rect} rect */
var spreadRect = (rect) => [rect.x, rect.y, rect.width, rect.height]
var EDGE_CONTROL_WIDTH = 10
/**
 * @param {Rect} rect 
 * @param {Point} point 
 */
var isPointInRect = (rect, point) => (point.x >= rect.x && point.x <= rect.x + rect.width) && (point.y >= rect.y && point.y <= rect.y + rect.width)

class Drawable {
    constructor(image = null) {
        /** @type */
        this.image = null
        this.rect = newRect()
        this.sourceRect = newRect()
    }

    /**
     * @param {number} oX
     * @param {number} oY
     * @param {Renderer} renderer
     * @param {"image" | "mover" | "edges"} stage
     */
    draw(oX, oY, renderer, stage) {
        var start = copyRect(this.rect)
        start.x += oX
        start.y += oY
        switch (stage) {
            case "image":
                renderer.ctx.fillStyle = "white"
                renderer.ctx.fillRect(...spreadRect(start))
                break
            case "mover":
                renderer.ctx.fillStyle = "#0099ff"
                renderer.ctx.strokeRect(...spreadRect(start))

                renderer.doControl(start, (over, down, delta) => {
                    if (down) {
                        this.rect.x += delta.x
                        this.rect.y += delta.y
                    }
                })
                break
            case "edges":
                var end = getRectEnd(start)
                var drawControl = (/** @type {Rect} */ rect, /** @type {bool} */ posX, /** @type {bool} */ posY) => {
                    renderer.doControl(rect, (over, down, delta) => {
                        if (down) {
                            this.rect.width += posX ? -delta.x : delta.x
                            this.rect.height += posY ? -delta.y : delta.y
                            if (posX) this.rect.x += delta.x
                            if (posY) this.rect.y += delta.y
                        }

                        renderer.ctx.strokeStyle = "#00ffff"
                        renderer.ctx.fillStyle = "#0099ff"
                        renderer.ctx.fillRect(...spreadRect(rect))
                        renderer.ctx.strokeRect(...spreadRect(rect))
                    })
                }

                drawControl(newRect(start.x - EDGE_CONTROL_WIDTH / 2, start.y - EDGE_CONTROL_WIDTH / 2, EDGE_CONTROL_WIDTH, EDGE_CONTROL_WIDTH), true, true)
                drawControl(newRect(end.x - EDGE_CONTROL_WIDTH / 2, start.y - EDGE_CONTROL_WIDTH / 2, EDGE_CONTROL_WIDTH, EDGE_CONTROL_WIDTH), false, true)
                drawControl(newRect(start.x - EDGE_CONTROL_WIDTH / 2, end.y - EDGE_CONTROL_WIDTH / 2, EDGE_CONTROL_WIDTH, EDGE_CONTROL_WIDTH), true, false)
                drawControl(newRect(end.x - EDGE_CONTROL_WIDTH / 2, end.y - EDGE_CONTROL_WIDTH / 2, EDGE_CONTROL_WIDTH, EDGE_CONTROL_WIDTH), false, false)
                break
        }


    }
}
class Renderer {
    /**
     * @typedef {(over : boolean, down : boolean, delta : Point)=>void} ControlCallback
     * @typedef {{rect : Rect, callback : ControlCallback, down : boolean, over : boolean, origPos : Point}} Control
     */

    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        /** @type {Drawable[]} */
        this.drawables = []
        this.oX = 0
        this.oY = 0
        this.canvas = canvas
        this.ctx = canvas.getContext("2d", { alpha: true })
        /** @type {Point} */
        this.lastMousePos = { x: 0, y: 0 }
        /** @type {Point} */
        this.mousePos = { x: 0, y: 0 }
        this.mouseDown = false
        this.wasMouseDown = false

        canvas.addEventListener("mousemove", (event) => {
            this.mousePos = { x: event.x, y: event.y }
        })

        canvas.addEventListener("mouseup", () => {
            this.mouseDown = false
        })

        canvas.addEventListener("mousedown", () => {
            this.mouseDown = true
        })

        this.overHandled = false
    }

    /**
     * 
     * @param {Rect} rect 
     * @param {ControlCallback} callback 
     */
    doControl(rect, callback) {
        if (!this.overHandled && (isPointInRect(rect, this.mousePos) || isPointInRect(rect, this.lastMousePos))) {
            this.overHandled = true
            if (this.mouseDown) {
                callback(true, true, { x: this.mousePos.x - this.lastMousePos.x, y: this.mousePos.y - this.lastMousePos.y })
            } else callback(true, false, { x: 0, y: 0 })
        } else callback(false, false, { x: 0, y: 0 })
    }

    draw() {
        var clientRect = canvas.getBoundingClientRect()
        canvas.width = clientRect.width
        canvas.height = clientRect.height

        {} (["image", "edges", "mover", "edges"]).forEach(v => {
            for (let drawable of this.drawables) {
                drawable.draw(Math.floor(this.oX + clientRect.width / 2), Math.floor(this.oY + clientRect.height / 2), this, v)
            }
        })

        this.wasMouseDown = this.mouseDown
        this.overHandled = false
        this.lastMousePos = { ...this.mousePos }
    }


}

var renderer = new Renderer(canvas)

renderer.drawables.push(new Drawable())
renderer.drawables[0].rect = { x: 0, y: 0, width: 50, height: 50 }

function update() {
    renderer.draw()

    requestAnimationFrame(update)
}

update()