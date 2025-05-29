import { createSvgElement, PRIMARY_COLOR, SECONDARY_COLOR } from "../board/support"
import { HandleObject } from "./HandleObject"


export abstract class DotHandleObject extends HandleObject {
    protected _element: SVGCircleElement | null = null

    public override getElement(): SVGElement {
        if (this._element == null) {
            this._element = createSvgElement("circle")
            this._element.setAttribute("fill", SECONDARY_COLOR)
            this._element.setAttribute("stroke", PRIMARY_COLOR)
            this._element.setAttribute("r", "4px")
            this._element.style.cursor = "pointer"
        }

        return this._element
    }
}
