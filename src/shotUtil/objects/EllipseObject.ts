import { createSvgElement } from "../board/support"
import { ShapeObject } from "./ShapeObject"

export class EllipseObject extends ShapeObject {
    protected _renderElement: SVGEllipseElement | null = null
    protected _getRenderShape(): SVGElement {
        return this._renderElement ??= createSvgElement("ellipse")
    }
}
