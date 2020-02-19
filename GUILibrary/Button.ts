import { GUIControl, Point, IControlMouseState } from "./GUI.js"

export class Button extends GUIControl {
    public fill = "#ffffff"
    public stroke = "#ffffff"
    public fillHover = "#ffffff"
    public strokeHover = "#00ffff"
    public fillDown = "#aaaaaa"
    public strokeDown = "#00ffff"

    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        this.setStyles(ctx)

        var baseRect = this.getScreenRect(offset)

        ctx.fillRect(...baseRect.spread())
        ctx.strokeRect(...baseRect.spread())
    }

    setMouseState(state : IControlMouseState) {
        super.setMouseState(state)
        if (state.click) this.onClick()
        return true
    }

    protected onClick() {
        // To override
    }

    protected setStyles(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.mouseState.over ? (this.mouseState.down ? this.fillDown : this.fillHover) : this.fill
        ctx.strokeStyle = this.mouseState.over ? (this.mouseState.down ? this.strokeDown : this.strokeHover) : this.stroke
    }
}