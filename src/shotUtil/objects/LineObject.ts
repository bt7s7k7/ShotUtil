import { cloneArray } from "../../comTypes/util"
import { Point } from "../../drawer/Point"
import { useGrab } from "../../vue3gui/useGrab"
import { applyPositionAndSize, createSvgElement, HIGHLIGHT_COLOR } from "../board/support"
import { DotHandleObject } from "../editable/DotHandleObject"
import { EditableObject } from "../editable/EditableObject"
import { HandleObject } from "../editable/HandleObject"

const MIN_SELECTABLE_LINE_WIDTH = 6

export class LineOutlineHandle extends HandleObject {
    protected _element: SVGPolylineElement | null = null

    public override getElement(): SVGElement {
        if (this._element == null) {
            this._element = createSvgElement("polyline")

            this._element.setAttribute("stroke", HIGHLIGHT_COLOR)
            this._element.style.cursor = "pointer"

            const owner = this.owner
            const handler = useGrab({
                onMoveStart(event) {
                    event.nativeEvent.stopPropagation()
                    return cloneArray(owner.points)
                },
                onMove(event, state) {
                    const delta = owner.board.snapPoint(new Point(event.deltaX, event.deltaY))
                    if (delta.isZero()) return
                    owner.points = state.map(v => v.add(delta))
                    owner.flushChanges()
                },
                onMoveEnd(_, state) {
                    owner.board.undoSteps.push(() => {
                        owner.board.select(owner)
                        owner.points = state
                        owner.flushChanges()
                    })
                },
            })
            this._element.addEventListener("mousedown", handler)
        }

        return this._element
    }

    public override flush(): void {
        const element = this.getElement()
        element.setAttribute("stroke-width", Math.max(MIN_SELECTABLE_LINE_WIDTH, this.owner.width) + "px")
        element.setAttribute("points", this.owner["_getRenderShape"]().getAttribute("points")!)

    }

    constructor(
        public readonly owner: LineObject,
    ) { super(owner) }
}

export class LineWaypointHandle extends DotHandleObject {
    public override getElement(): SVGElement {
        if (this._element == null) {
            this._element = super.getElement() as SVGCircleElement

            const { owner, index } = this
            const handler = useGrab({
                onMoveStart(event) {
                    event.nativeEvent.stopPropagation()
                    return owner.points[index]
                },
                onMove(event, state) {
                    const delta = owner.board.snapPoint(new Point(event.deltaX, event.deltaY))
                    if (delta.isZero()) return
                    owner.points[index] = state.add(delta)
                    owner.flushChanges()
                },
                onMoveEnd(_, state) {
                    owner.board.undoSteps.push(() => {
                        owner.board.select(owner)
                        owner.points[index] = state
                        owner.flushChanges()
                    })
                },
            })

            this._element.addEventListener("mousedown", handler)
        }

        return super.getElement()
    }

    public flush(): void {
        const position = this.owner.points[this.index]
        applyPositionAndSize(this.getElement(), position, null)
    }

    constructor(
        public readonly owner: LineObject,
        public readonly index: number,
    ) { super(owner) }
}

export class LineObject extends EditableObject {
    public points: Point[] = []
    public width = 1

    protected _handles: HandleObject[] | null = null
    protected override _getHandles(): HandleObject[] {
        return this._handles ??= [
            new LineOutlineHandle(this),
            ...this.points.map((_, i) => new LineWaypointHandle(this, i)),
        ]
    }

    protected _element: SVGPolylineElement | null = null
    protected override _getRenderShape(): SVGElement {
        return this._element ??= createSvgElement("polyline")
    }

    protected override _getSelectionElement(): SVGElement {
        if (this._selectionElement == null) {
            super._getSelectionElement().setAttribute("stroke-width", Math.max(MIN_SELECTABLE_LINE_WIDTH, this.width) + "px")
        }

        return super._getSelectionElement()
    }

    protected override _flushGeometry(shape: SVGElement): void {
        shape.setAttribute("points", this.points.map(v => `${v.x},${v.y}`).join(" "))
    }

    protected override _flushStyle(shape: SVGElement): void {
        shape.setAttribute("stroke", "white")
        shape.setAttribute("stroke-width", `${this.width}px`)
    }
}
