import { applyPositionAndSize, createSvgElement } from "../board/support"
import { ShapeObject } from "./ShapeObject"

export class RectObject extends ShapeObject {
    protected _renderElement: SVGRectElement | null = null
    protected _getRenderShape(): SVGElement {
        return this._renderElement ??= createSvgElement("rect")
    }

    protected _flushGeometry(shape: SVGElement): void {
        applyPositionAndSize(shape, this.position, this.size)
    }

    protected _flushStyle(shape: SVGElement): void {
        shape.setAttribute("fill", "white")
    }

}
