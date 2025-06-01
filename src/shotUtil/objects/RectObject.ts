import { Color } from "../../drawer/Color"
import { applyPositionAndSize, createSvgElement } from "../board/support"
import { ColorProperty } from "../properties/ColorProperty"
import { ShapeObject } from "./ShapeObject"

export class RectObject extends ShapeObject {
    public color = ColorProperty.add(this, Color.white)

    protected _renderElement: SVGRectElement | null = null
    protected _getRenderShape(): SVGElement {
        return this._renderElement ??= createSvgElement("rect")
    }

    protected _flushGeometry(shape: SVGElement): void {
        applyPositionAndSize(shape, this.position, this.size)
    }

    protected _flushStyle(shape: SVGElement): void {
        shape.setAttribute("fill", this.color.toHex())
    }
}
