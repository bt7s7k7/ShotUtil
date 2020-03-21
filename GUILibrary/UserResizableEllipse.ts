import { Point } from "./GUI.js";
import { UserResizableShape } from "./UserResizableShape.js";

export class UserResizableEllipse extends UserResizableShape {
    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        var screenRect = this.getScreenRect(offset)
        ctx.beginPath()
        ctx.ellipse(
            screenRect.x + screenRect.width / 2,
            screenRect.y + screenRect.height / 2,
            Math.abs(screenRect.width / 2 - this.shapeStyle.lineWidth), // This is the radius so /2, minus lineWidth to prevent clipping outside the rect
            Math.abs(screenRect.height / 2 - this.shapeStyle.lineWidth),
            0, 0, Math.PI * 2
        )
        ctx.strokeStyle = this.shapeStyle.color
        ctx.lineWidth = this.shapeStyle.lineWidth
        ctx.stroke()

        super.draw(offset, ctx)
    }
}
