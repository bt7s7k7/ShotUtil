import { Draggable } from "./Draggable.js";
import { Point, Rect, IControlMouseState } from "./GUI.js";
import { Button, defaultButtonStyle, IButtonStyle } from "./Button.js";

export interface IUserResizableStyle {
    stroke: string,
    buttonStyle: IButtonStyle
}

export const defaultUserResizableStyle = {
    stroke: "#ffffff",
    buttonStyle: defaultButtonStyle
} as IUserResizableStyle


export class UserResizable extends Draggable {
    public preserveAspectRatio = false
    protected style = defaultUserResizableStyle
    constructor() {
        super()
        this.append(new Button())
        this.append(new Button())
        this.append(new Button())
        this.append(new Button())

        var buttonChildren = this.children as Button[]
        buttonChildren.forEach(v => v.rect = new Rect(-4, -4, 8, 8))

        buttonChildren[1].getScreenRect = function (offset) { return Button.prototype.getScreenRect.apply(this, [offset.add(new Point(this.parent.rect.width, 0))]) }
        buttonChildren[2].getScreenRect = function (offset) { return Button.prototype.getScreenRect.apply(this, [offset.add(new Point(this.parent.rect.width, this.parent.rect.height))]) }
        buttonChildren[3].getScreenRect = function (offset) { return Button.prototype.getScreenRect.apply(this, [offset.add(new Point(0, this.parent.rect.height))]) }

        buttonChildren[0].onDrag = function (delta) { this.parent.resize(-1, -1, -delta.x, -delta.y) }
        buttonChildren[1].onDrag = function (delta) { this.parent.resize(0, -1, delta.x, -delta.y) }
        buttonChildren[2].onDrag = function (delta) { this.parent.resize(0, 0, delta.x, delta.y) }
        buttonChildren[3].onDrag = function (delta) { this.parent.resize(-1, 0, -delta.x, delta.y) }

        this.setStyle(this.style)
    }

    setMouseState(state: IControlMouseState) {
        if (state.down[this.buttonToListenTo]) this.selectionManager.select(this)
        return super.setMouseState(state)
    }

    resize(tX: number, tY: number, oW: number, oH: number) {
        var aspectRatio = this.rect.width / this.rect.height
        /*if (this.preserveAspectRatio) {
            let noW = oH * aspectRatio
            let noH = oW / aspectRatio

            if (Math.abs(noW) > Math.abs(noH)) {
                oW = oH = noW
            } else {
                oW = oH = noH
            }
        }*/
        var orig = this.rect.size()
        this.rect = this.rect.expand(oW, oH)

        this.rect.width = this.rect.height * aspectRatio

        this.rect = this.rect.translate(this.rect.size().add(orig.mul(-1)).scale(tX, tY))
    }

    setStyle(style: IUserResizableStyle) {
        this.style = style
        this.children.forEach(v => (v as Button).style = this.style.buttonStyle)
    }

    protected focused = true

    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        if (this.focused) ctx.strokeRect(...this.getScreenRect(offset).spread())
    }

    focus() {
        this.children.forEach(v => v.enabled = true)
        this.focused = true
    }

    blur() {
        this.children.forEach(v => v.enabled = false)
        this.focused = false

    }

    public selectionManager: ResizableSelectionManager
    registerManager(manager: ResizableSelectionManager) {
        this.selectionManager = manager
        this.blur()
    }
    
        copy() {
            var copy = new (this as any).constructor() as UserResizable
            var children = copy.children
            Object.assign(copy, this)
            copy.children = children
            copy.parent = null
    
            copy.rect = this.rect.translate(20, 20)

            return copy
        }
}

export class ResizableSelectionManager {
    protected selected: UserResizable

    deselect() {
        this.selected?.blur()
        this.selected = null
    }

    select(target: UserResizable) {
        this.selected?.blur()
        this.selected = target
        target.focus()
    }

    getSelected() {
        return this.selected
    }
}
