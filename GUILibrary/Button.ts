import { GUIControl, Point } from "./GUI.js"

export class Button extends GUIControl {
    public fill = "#ffffff"
    public stroke = "#ffffff"
    public fillHover = "#ffffff"
    public strokeHover = "00ffff"
    public fillDown = "#aaaaaa"
    public strokeDown = "#00ffff"

    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.over ? (this.down ? this.fillDown : this.fillHover) : this.fill
        ctx.strokeStyle = this.over ? (this.down ? this.strokeDown : this.strokeHover) : this.stroke

        var baseRect = this.getScreenRect(offset)

        ctx.fillRect(...baseRect.spread())
        ctx.strokeRect(...baseRect.spread())
    }
}