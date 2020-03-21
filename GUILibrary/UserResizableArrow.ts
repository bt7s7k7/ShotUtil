import { UserResizableShape } from "./UserResizableShape.js";
import { Point, Rect } from "./GUI.js";


export class UserResizableArrow extends UserResizableShape {
    public target = new Point(0, 0)
    public preserveAspectRatio = true
    public armLength = 20

    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        var screenRect = this.getScreenRect(offset)
        
        var center = new Point(screenRect).add(screenRect.size().mul(0.5))
        var angle = (this.target.add(offset)).add(center.mul(-1)).normalize().toAngle()
        
        if (this.focused) {
            ctx.strokeStyle = "#1a1a1a"
            ctx.fillStyle = "#ffffff"
            
            var rect = new Rect(this.target.add(offset).add(-5, -5), 10, 10)

            ctx.fillRect(...rect.spread())
            ctx.strokeRect(...rect.spread())
        }
        
        var extent = Point.fromAngle(angle).scale(this.rect.size().mul(0.5).add(-4, -4))
        var armLOffset = Point.fromAngle(angle + Math.PI * 4 / 5).mul(this.armLength)
        var armROffset = Point.fromAngle(angle - Math.PI * 4 / 5).mul(this.armLength)
        
        var ending = center.add(extent)
        var start = center.add(extent.mul(-1))
        var armLEnd = ending.add(armLOffset)
        var armREnd = ending.add(armROffset)
        
        ctx.strokeStyle = this.shapeStyle.color
        ctx.lineWidth = this.shapeStyle.lineWidth
        
        ctx.beginPath()
        ctx.moveTo(...start.spread())
        ctx.lineTo(...ending.spread())
        ctx.lineTo(...armLEnd.spread())
        ctx.lineTo(...ending.spread())
        ctx.lineTo(...armREnd.spread())
        ctx.stroke()

        super.draw(offset, ctx)
    }

    rotateTo(pos: Point) {
        this.target = pos
    }
}