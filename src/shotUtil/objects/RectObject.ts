import { createSvgElement } from "../board/support"
import { ShapeObject } from "./ShapeObject"

export class RectObject extends ShapeObject {
    protected _renderElement: SVGRectElement | null = null
    protected _getRenderShape(): SVGElement {
        return this._renderElement ??= createSvgElement("rect")
    }
}
