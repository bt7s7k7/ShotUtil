import { Point } from "../../drawer/Point"
import { buildPolyline, createSvgElement } from "../board/support"
import { MarkerObject } from "./MarkerObject"

const _POINTS = [
    new Point(1, 0),
    new Point(0, 0.5),
    new Point(1, 1),
    //new Point(0.5, 0.5),
]

const _SIZE = 8
const _ARROW = buildPolyline(_POINTS, _SIZE, _SIZE, true, false)

export class ArrowMarkerObject extends MarkerObject {
    protected _element: SVGElement | null = null
    protected _getRenderElement(): SVGElement {
        if (this._element == null) {
            this._element = createSvgElement("polyline")
            this._element.setAttribute("fill", "none")
            this._element.setAttribute("stroke", "context-stroke")
            this._element.setAttribute("points", _ARROW)
        }

        return this._element
    }

    constructor() {
        super({
            markerWidth: _SIZE.toString(),
            markerHeight: _SIZE.toString(),
            refX: (_SIZE).toString(),
            refY: (_SIZE * 0.5).toString(),
            orient: "auto-start-reverse",
            overflow: "visible",
        })
    }
}
