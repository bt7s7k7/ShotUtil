import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { Shape } from "../Shape"
import { ShapeUtil } from "../ShapeUtil"

export abstract class BoxShape extends Shape {
    public keepAspectRatio = false

    protected _scaleCallback(rect: Rect, initialRect: Rect) {
        this.rect = rect
    }

    public getHandles() {
        const initRect = this.rect
        const options = { rect: this.rect, keepAspectRatio: this.keepAspectRatio, worldToScreen: this.editor.camera.worldToScreen, callback: (v: Rect) => this._scaleCallback(v, initRect) }

        return [
            ShapeUtil.makeScaleHandle({ direction: new Point(1, 0), cursor: "e-resize", ...options }),
            ShapeUtil.makeScaleHandle({ direction: new Point(-1, 0), cursor: "w-resize", ...options }),
            ShapeUtil.makeScaleHandle({ direction: new Point(0, 1), cursor: "s-resize", ...options }),
            ShapeUtil.makeScaleHandle({ direction: new Point(0, -1), cursor: "n-resize", ...options }),
            ShapeUtil.makeScaleHandle({ direction: new Point(1, 1), cursor: "se-resize", ...options }),
            ShapeUtil.makeScaleHandle({ direction: new Point(1, -1), cursor: "ne-resize", ...options }),
            ShapeUtil.makeScaleHandle({ direction: new Point(-1, 1), cursor: "sw-resize", ...options }),
            ShapeUtil.makeScaleHandle({ direction: new Point(-1, -1), cursor: "nw-resize", ...options }),
        ]
    }

    public testCollision(point: Point) {
        return Rect.union([this.rect]).containsPoint(point)
    }

    public drawOutline(): void {
        const rect = this.editor.camera.worldToScreen.transformRect(this.rect).makePixelPerfect()

        this.editor.drawer
            .beginPath().rect(rect)
            .use(ShapeUtil.drawOutline)
    }

    public getPos() {
        return this.rect.center()
    }

    public setPos(newPos: Point) {
        this.rect = new Rect(newPos.add(this.rect.size().mul(-0.5)), this.rect.size())
    }

    public getBoundingBox() {
        return this.rect
    }

    constructor(
        public rect: Rect
    ) { super() }
}
