import { unreachable } from "../../comTypes/util"
import { Point } from "../../drawer/Point"

export const TRANSPARENT = "rgba(0,0,0,0)"
export const HIGHLIGHT_COLOR = "rgba(0, 242, 255, 0.23)"
export const PRIMARY_COLOR = "rgb(0, 242, 255)"
export const SECONDARY_COLOR = "black"

export function createSvgElement<TTagName extends keyof SVGElementTagNameMap>(tagName: TTagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName)
}

export function applyPositionAndSize(element: SVGElement, position: Point | null, size: Point | null) {
    if (element instanceof SVGRectElement) {
        if (position && size) {
            position = position.add(size.mul(-0.5)).floor().add(0.5, 0.5)
        }

        if (position) {
            element.setAttribute("x", position.x + "px")
            element.setAttribute("y", position.y + "px")
        }

        if (size) {
            element.setAttribute("width", size.x + "px")
            element.setAttribute("height", size.y + "px")
        }

        return
    }

    if (element instanceof SVGCircleElement) {
        if (position) {
            element.setAttribute("cx", position.x + "px")
            element.setAttribute("cy", position.y + "px")
        }

        if (size) {
            element.setAttribute("r", size.x + "px")
        }
        return
    }

    unreachable()
}
