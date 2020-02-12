/** @type {HTMLCanvasElement} */
var canvas = document.getElementById("canvas")

/** @typedef {{x : number, y : number, width : number, height : number}} Rect */

var newRect = () => ({ x: 0, y: 0, width: 0, height: 0 })

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
        ctx.fillRect(this.rect.x + oX, this.rect.y + oY, this.rect.width, this.rect.height)
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
    }
}

var renderer = new Renderer(canvas)

function update() {
    renderer.draw()

    requestAnimationFrame(update)
}

update()