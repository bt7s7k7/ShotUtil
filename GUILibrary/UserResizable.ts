import { Draggable } from "./Draggable.js";
import { Point, Rect } from "./GUI.js";
import { Button } from "./Button.js";

export class UserResizable extends Draggable {
    public preserveAspectRatio = false
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
}
