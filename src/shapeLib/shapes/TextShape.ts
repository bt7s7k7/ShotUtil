import { Color } from "../../drawer/Color"
import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { Handle } from "../Handle"
import { Shape } from "../Shape"
import { ShapeUtil } from "../ShapeUtil"

export class TextShape extends Shape {
    public text = "New Text"
    public pos = Point.NaN
    public fontSize = 24
    public color = Color.red

    protected _lastBoundingBox = Rect.zero

    public draw(): void {
        this.editor.drawer.setStyle(this.color).fillText(this.text, this.pos, {
            size: this.fontSize,
            align: "center",
            baseline: "middle",
            outline: (options) => {
                this._lastBoundingBox = Rect.extends(this.pos, new Point(options.metrics.width, options.size))
            }
        })
    }

    public drawOutline(): void {
        this.editor.drawer
            .beginPath()
            .rect(this.editor.camera.worldToScreen.transformRect(this._lastBoundingBox).makePixelPerfect())
            .use(ShapeUtil.drawOutline)
    }

    public getBoundingBox(): Rect {
        return this._lastBoundingBox
    }

    public testCollision(point: Point): boolean {
        return this._lastBoundingBox.containsPoint(point)
    }

    public getPos() {
        return this.pos
    }

    public setPos(newPos: Point) {
        this.pos = newPos
    }

    public getHandles(): Handle[] {
        return []
    }
}
