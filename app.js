/** @type {HTMLCanvasElement} */
var canvas = document.getElementById("canvas")

/** @typedef {{x : number, y : number, width : number, height : number}} Rect */

var newRect = (x = 0, y = 0, width = 0, height = 0) => ({ x, y, width, height })
/** @param {Rect} rect */
var getRectEnd = (rect) => ({x: rect.x + rect.width, y: rect.y + rect.height})
/** @param {Rect} rect */
var copyRect = (rect) => Object.assign({}, rect);
/** @param {Rect} rect */
var spreadRect = (rect) => [rect.x, rect.y, rect.height, rect.width]
var EDGE_CONTROL_WIDTH = 10

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
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(oX, oY, ctx) {
        ctx.fillStyle = "white"
        var baseRect = copyRect(this.rect)
        baseRect.x += oX
        baseRect.y += oY
        ctx.fillRect(...spreadRect(baseRect))
    }

    /**
     * @param {number} oX
     * @param {number} oY
     * @param {CanvasRenderingContext2D} ctx
     */
    drawControls(oX, oY, ctx) {
        ctx.strokeStyle = "#00ffff"
        ctx.fillStyle = "#0099ff"
        var start = copyRect(this.rect)
        start.x += oX
        start.y += oY
        ctx.strokeRect(...spreadRect(start))

        var end = getRectEnd(start)
        var drawControl = (/** @type {Rect} */rect) => {
            ctx.fillRect(...spreadRect(rect))
            ctx.strokeRect(...spreadRect(rect))
        }

        drawControl(newRect(start.x - EDGE_CONTROL_WIDTH / 2, start.y - EDGE_CONTROL_WIDTH / 2, EDGE_CONTROL_WIDTH, EDGE_CONTROL_WIDTH))
        drawControl(newRect(end.x - EDGE_CONTROL_WIDTH / 2, start.y - EDGE_CONTROL_WIDTH / 2, EDGE_CONTROL_WIDTH, EDGE_CONTROL_WIDTH))
        drawControl(newRect(start.x - EDGE_CONTROL_WIDTH / 2, end.y - EDGE_CONTROL_WIDTH / 2, EDGE_CONTROL_WIDTH, EDGE_CONTROL_WIDTH))
        drawControl(newRect(end.x - EDGE_CONTROL_WIDTH / 2, end.y - EDGE_CONTROL_WIDTH / 2, EDGE_CONTROL_WIDTH, EDGE_CONTROL_WIDTH))
    }
}
class Renderer {
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
    }

    draw() {
        var clientRect = canvas.getBoundingClientRect()
        canvas.width = clientRect.width
        canvas.height = clientRect.height

        for (let drawable of this.drawables) {
            drawable.draw(Math.floor(this.oX + clientRect.width / 2), Math.floor(this.oY + clientRect.height / 2), this.ctx)
        }
        for (let drawable of this.drawables) {
            drawable.drawControls(Math.floor(this.oX + clientRect.width / 2), Math.floor(this.oY + clientRect.height / 2), this.ctx)
        }
    }
}

var renderer = new Renderer(canvas)

renderer.drawables.push(new Drawable())
renderer.drawables[0].rect = {x: 0, y: 0, width: 50, height: 50}

function update() {
    renderer.draw()

    requestAnimationFrame(update)
}

update()