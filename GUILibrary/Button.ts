import { GUIControl, Point, IControlMouseState, ButtonState } from "./GUI.js"

export interface IButtonStyle {
    fill : string
    stroke : string
    fillHover : string
    strokeHover : string
    fillDown : string
    strokeDown : string
}

export const defaultButtonStyle = {
    fill: "#ffffff",
    stroke: "#ffffff",
    fillDown: "#aaaaaa",
    fillHover: "#ffffff",
    strokeDown: "#00ffff",
    strokeHover: "#00ffff",
} as IButtonStyle

export class Button extends GUIControl {
    public style = defaultButtonStyle
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

    onClick() {
        // To override
    }

    onDrag(delta: Point) {
        // To override
    }

    protected setStyles(ctx: CanvasRenderingContext2D) {
        const down = this.mouseState.down.reduce((p, c) => p || c)
        ctx.fillStyle = this.mouseState.over ? (down ? this.style.fillDown : this.style.fillHover) : this.style.fill
        ctx.strokeStyle = this.mouseState.over ? (down ? this.style.strokeDown : this.style.strokeHover) : this.style.stroke
    }
}