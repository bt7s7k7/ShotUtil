import { Board } from "../board/Board"
import { BoardObject } from "../board/BoardObject"
import { createSvgElement, HIGHLIGHT_COLOR, TRANSPARENT } from "../board/support"
import { HandleObject } from "./HandleObject"

export abstract class EditableObject extends BoardObject {
    protected _handleContainer: SVGGElement | null = null

    protected abstract _getHandles(): HandleObject[]
    protected abstract _getRenderShape(): SVGElement

    protected abstract _flushGeometry(shape: SVGElement): void
    protected abstract _flushStyle(shape: SVGElement): void

    public override init(board: Board): void {
        super.init(board)
        board.renderHost.append(this._getRenderShape())
        board.selectionHost.append(this._getSelectionElement())
    }

    public override teardown(): void {
        if (this._handleContainer) this.setSelectedState(false)
        this._getRenderShape().remove()
        this._getSelectionElement().remove()
    }

    public override setSelectedState(selected: boolean): void {
        if (selected == false) {
            this._handleContainer!.remove()
            this._handleContainer = null
            return
        }

        this._handleContainer = createSvgElement("g")
        for (const handle of this._getHandles()) {
            this._handleContainer.append(handle.getElement())
            handle.flush()
        }
        this.board.controlHost.append(this._handleContainer)
    }

    protected _selectionElement: SVGElement | null = null
    protected _getSelectionElement(): SVGElement {
        if (this._selectionElement) return this._selectionElement
        this._selectionElement = this._getRenderShape().cloneNode() as SVGElement

        this._selectionElement.setAttribute("stroke", TRANSPARENT)
        this._selectionElement.setAttribute("fill", TRANSPARENT)
        this._selectionElement.style.cursor = "pointer"

        this._selectionElement.addEventListener("mouseenter", () => {
            this._selectionElement!.setAttribute("stroke", HIGHLIGHT_COLOR)
        })

        this._selectionElement.addEventListener("mouseleave", () => {
            this._selectionElement!.setAttribute("stroke", TRANSPARENT)
        })

        this._selectionElement.addEventListener("click", (event) => {
            event.stopPropagation()
            this.board.select(this)
        })

        return this._selectionElement
    }

    public override flushChanges(): void {
        this._flushGeometry(this._getRenderShape())
        this._flushGeometry(this._getSelectionElement())

        this._flushStyle(this._getRenderShape())

        if (this._handleContainer) {
            for (const handle of this._getHandles()) {
                handle.flush()
            }
        }
    }
}
