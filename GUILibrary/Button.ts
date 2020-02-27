import { GUIControl, Point, IControlMouseState, ButtonState } from "./GUI.js"

export class Button extends GUIControl {
    public fill = "#ffffff"
    public stroke = "#ffffff"
    public fillHover = "#ffffff"
    public strokeHover = "#00ffff"
    public fillDown = "#aaaaaa"
    public strokeDown = "#00ffff"
    public buttonToListenTo = 0

    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        this.setStyles(ctx)

        var baseRect = this.getScreenRect(offset)

        ctx.fillRect(...baseRect.spread())
        ctx.strokeRect(...baseRect.spread())
    }

    setMouseState(state: IControlMouseState) {
        super.setMouseState(state)
        if (state.click[this.buttonToListenTo]) this.onClick()
        if (state.down[this.buttonToListenTo]) this.onDrag(state.delta)
        return true
    }

    protected onClick() {
        // To override
    }

    protected onDrag(delta: Point) {
        // To override
    }

    protected setStyles(ctx: CanvasRenderingContext2D) {
        const down = this.mouseState.down.reduce((p, c) => p || c)
        ctx.fillStyle = this.mouseState.over ? (down ? this.fillDown : this.fillHover) : this.fill
        ctx.strokeStyle = this.mouseState.over ? (down ? this.strokeDown : this.strokeHover) : this.stroke
    }
}