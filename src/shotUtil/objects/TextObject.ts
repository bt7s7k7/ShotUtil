import { escapeHTML, unreachable } from "../../comTypes/util"
import { Point } from "../../drawer/Point"
import { Board } from "../board/Board"
import { applyPositionAndSize, createSvgElement } from "../board/support"
import { HorizontalAlign, HorizontalAlignProperty, TextProperty, VerticalAlign, VerticalAlignProperty } from "../properties/TextProperty"
import { ShapeObject } from "./ShapeObject"

export class TextObject extends ShapeObject {
    public verticalAlign: VerticalAlign = VerticalAlignProperty.add(this, "middle")
    public horizontalAlign: HorizontalAlign = HorizontalAlignProperty.add(this, "middle")
    public text = TextProperty.add(this, "Text")

    protected _renderElement: SVGRectElement | null = null
    protected _textElement: SVGTextElement | null = null

    protected _getRenderShape(): SVGElement {
        if (this._textElement == null) {
            this._textElement = createSvgElement("text")
        }
        return this._renderElement ??= createSvgElement("rect")
    }

    protected override _flushStyle(shape: SVGElement): void {
        super._flushStyle(this._textElement!)
        this._textElement!.setAttribute("stroke-width", "2")
        shape.setAttribute("fill", "none")
        shape.setAttribute("stroke", "none")
    }

    public override flushChanges(): void {
        super.flushChanges()

        const { position, size } = this
        applyPositionAndSize(this._textElement!, new Point(
            this.horizontalAlign == "start" ? (
                position.x + size.x * -0.5
            ) : this.horizontalAlign == "middle" ? (
                position.x
            ) : this.horizontalAlign == "end" ? (
                position.x + size.x * 0.5
            ) : unreachable(),
            this.verticalAlign == "hanging" ? (
                position.y + size.y * -0.5
            ) : this.verticalAlign == "middle" ? (
                position.y
            ) : this.verticalAlign == "auto" ? (
                position.y + size.y * 0.5
            ) : unreachable(),
        ).floor(), null, false)
        this._textElement!.setAttribute("dominant-baseline", this.verticalAlign)
        this._textElement!.setAttribute("text-anchor", this.horizontalAlign)
        const newContent = escapeHTML(this.text)
        if (newContent != this._textElement!.innerHTML) {
            this._textElement!.innerHTML = newContent
        }
    }

    public override teardown(): void {
        super.teardown()
        this._textElement?.remove()
    }

    public override moveToBack(): void {
        super.moveToBack()
        this._textElement!.parentElement!.insertBefore(this._textElement!, this._textElement!.parentElement!.firstChild)
    }

    public override moveToFront(): void {
        super.moveToFront()
        this._textElement!.parentElement!.append(this._textElement!)
    }

    public override init(board: Board): void {
        super.init(board)
        board.renderHost.append(this._textElement!)
    }
}
