import { Color } from "../../drawer/Color"
import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { BoxShape } from "./BoxShape"

export class EllipseShape extends BoxShape {
    public color = Color.red

    public draw(): void {
        this.editor.drawer
            .save()
            .beginPath()
            .setStyle(this.color)
            .setStrokeWidth(3)
            .ellipse(this.rect.center(), this.rect.size().mul(0.5))
            .stroke()
            .restore()
    }

    constructor() {
        super(new Rect(Point.NaN, Point.one.mul(100)))
    }
}
