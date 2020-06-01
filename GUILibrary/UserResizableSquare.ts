import { Point } from "./GUI.js";
import { UserResizableShape } from "./UserResizableShape.js";

export class UserResizableSquare extends UserResizableShape {
    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        var screenRect = this.getScreenRect(offset)
        ctx.fillStyle = this.shapeStyle.color
        ctx.fillRect(...screenRect.spread())

        super.draw(offset, ctx)
    }
}
