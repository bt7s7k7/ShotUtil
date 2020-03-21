import { UserResizableShape } from "./UserResizableShape.js";
import { Point } from "./GUI.js";

export class UserResizableText extends UserResizableShape {
    public text = "Hello world!"
    public font = "Arial"

    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        var screenRect = this.getScreenRect(offset)
        
        ctx.font = `${screenRect.height}px ${this.font}`
        ctx.textBaseline = "top"
        ctx.fillStyle = this.shapeStyle.color
        ctx.strokeStyle = "#1a1a1a"
        ctx.lineWidth = 1
        
        ctx.fillText(this.text, screenRect.x, screenRect.y, screenRect.width)
        ctx.strokeText(this.text, screenRect.x, screenRect.y, screenRect.width)

        super.draw(offset, ctx)
    }

    openTextPrompt() {
        var newText = prompt("Enter new text", this.text)

        if (newText) this.text = newText
    }
}