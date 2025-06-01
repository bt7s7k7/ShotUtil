import { cloneArray } from "../../comTypes/util"
import { Color } from "../../drawer/Color"
import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { useGrab } from "../../vue3gui/useGrab"
import { DragActivity } from "../board/Board"
import { applyPositionAndSize, createSvgElement, HIGHLIGHT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../board/support"
import { DotHandleObject } from "../editable/DotHandleObject"
import { EditableObject } from "../editable/EditableObject"
import { HandleObject } from "../editable/HandleObject"
import { EndArrowProperty, StartArrowProperty } from "../properties/ArrowProperty"
import { ColorProperty } from "../properties/ColorProperty"
import { LINE_WIDTHS, LineWidthProperty } from "../properties/LineWidthProperty"
import { ArrowMarkerObject } from "./ArrowMarkerObject"
import { MarkerObject } from "./MarkerObject"

const MIN_SELECTABLE_LINE_WIDTH = 6
const ADD_WAYPOINT_HANDLE_OFFSET = 35

export class LineOutlineHandle extends HandleObject {
    protected _element: SVGPolylineElement | null = null

    public override getElement(): SVGElement {
        if (this._element == null) {
            this._element = createSvgElement("polyline")

            this._element.setAttribute("fill", "none")
            this._element.setAttribute("stroke", HIGHLIGHT_COLOR)
            this._element.style.cursor = "pointer"

            const owner = this.owner
            const dragActivity = new DragActivity()
            const handler = useGrab({
                onMoveStart(event) {
                    let target = owner

                    if (event.nativeEvent instanceof MouseEvent && event.nativeEvent.ctrlKey) {
                        target = owner.duplicate()
                        owner.board.addObject(target)
                        owner.board.select(target)
                    }

                    owner.board.dragActivity = dragActivity
                    dragActivity.interrupted = false
                    if (target == owner) {
                        dragActivity.deleteHandler = () => {
                            target.board.removeObjectWithUndo(target)
                        }
                    } else {
                        dragActivity.deleteHandler = () => {
                            target.board.removeObject(target)
                        }
                    }
                    dragActivity.interruptHandler = event.forceStop

                    event.nativeEvent.stopPropagation()
                    return [target, cloneArray(owner.points)] as const
                },
                onMove(event, [target, state]) {
                    const delta = target.board.snapPoint(new Point(event.deltaX, event.deltaY).mul(target.board.eventScale))
                    if (delta.isZero()) return
                    target.points = state.map(v => v.add(delta))
                    target.flushChanges()
                    target.board.updateBounds()
                },
                onMoveEnd(_, [target, state]) {
                    target.board.dragActivity = null

                    if (dragActivity.interrupted) {
                        target.points = state
                        target.flushChanges()
                        return
                    }

                    if (target == owner) {
                        target.board.undoSteps.push(() => {
                            target.board.select(target)
                            target.points = state
                            target.flushChanges()
                            target.board.updateBounds()
                        })
                    } else {
                        target.board.undoSteps.push(() => {
                            target.board.removeObject(target)
                        })
                    }
                },
            })
            this._element.addEventListener("mousedown", handler)
        }

        return this._element
    }

    public override flush(): void {
        const element = this.getElement()
        element.setAttribute("stroke-width", MIN_SELECTABLE_LINE_WIDTH + "px")
        element.setAttribute("points", this.owner["_getRenderShape"]().getAttribute("points")!)
    }

    constructor(
        public readonly owner: LineObject,
    ) { super(owner) }
}

export class LineAddWaypointHandle extends HandleObject {
    protected _element: SVGRectElement | null = null
    public override getElement(): SVGElement {
        if (this._element == null) {
            this._element = createSvgElement("rect")
            this._element.setAttribute("fill", SECONDARY_COLOR)
            this._element.setAttribute("stroke", PRIMARY_COLOR)
            this._element.style.cursor = "pointer"

            const dragActivity = new DragActivity()
            const { owner, index } = this
            const handler = useGrab({
                onMoveStart: (event) => {
                    owner.board.dragActivity = dragActivity
                    dragActivity.interrupted = false
                    dragActivity.deleteHandler = null
                    dragActivity.interruptHandler = event.forceStop

                    event.nativeEvent.stopPropagation()
                    const newPosition = owner.board.snapPoint(this._getPosition()).floor().add(0.5, 0.5)
                    owner.points.splice(index, 0, newPosition)
                    owner.rebuildHandles()
                    return owner.points[index]
                },
                onMove(event, state) {
                    const delta = owner.board.snapPoint(new Point(event.deltaX, event.deltaY).mul(owner.board.eventScale))
                    if (delta.isZero()) return
                    owner.points[index] = state.add(delta).floor().add(0.5, 0.5)
                    owner.flushChanges()
                    owner.board.updateBounds()
                },
                onMoveEnd() {
                    owner.board.dragActivity = null

                    if (dragActivity.interrupted) {
                        owner.points.splice(index, 1)
                        owner.rebuildHandles()
                        owner.flushChanges()
                        owner.board.updateBounds()
                        return
                    }

                    owner.board.undoSteps.push(() => {
                        owner.board.select(owner)
                        owner.points.splice(index, 1)
                        owner.rebuildHandles()
                        owner.flushChanges()
                        owner.board.updateBounds()
                    })
                },
            })

            this._element.addEventListener("mousedown", handler)
        }

        return this._element
    }

    protected _getPosition() {
        if (this.index == this.owner.points.length) {
            const last = this.owner.points.at(-1)!
            const secondToLast = this.owner.points.at(-2)!
            const vector = last.sub(secondToLast).normalize()
            return last.add(vector.mul(ADD_WAYPOINT_HANDLE_OFFSET))
        } else if (this.index == 0) {
            const first = this.owner.points[0]
            const second = this.owner.points[1]
            const vector = first.sub(second).normalize()
            return first.add(vector.mul(ADD_WAYPOINT_HANDLE_OFFSET))
        } else {
            const next = this.owner.points[this.index]
            const prev = this.owner.points[this.index - 1]
            return next.add(prev).mul(0.5)
        }
    }

    public flush(): void {
        const position = this._getPosition()
        applyPositionAndSize(this.getElement(), position, new Point(8, 8), true)
    }

    constructor(
        public readonly owner: LineObject,
        public readonly index: number,
    ) { super(owner) }
}

export class LineWaypointHandle extends DotHandleObject {
    public override getElement(): SVGElement {
        if (this._element == null) {
            this._element = super.getElement() as SVGCircleElement

            const dragActivity = new DragActivity()
            const { owner, index } = this
            const handler = useGrab({
                onMoveStart(event) {
                    let target = owner

                    if (event.nativeEvent instanceof MouseEvent && event.nativeEvent.ctrlKey) {
                        target = owner.duplicate()
                        owner.board.addObject(target)
                        owner.board.select(target)
                    }

                    const position = owner.points[index]

                    owner.board.dragActivity = dragActivity
                    dragActivity.interrupted = false

                    if (target == owner) {
                        dragActivity.deleteHandler = () => {
                            owner.points.splice(index, 1)

                            owner.board.undoSteps.push(() => {
                                owner.points.splice(index, 0, position)
                                owner.rebuildHandles()
                                owner.flushChanges()
                            })

                            owner.rebuildHandles()
                            owner.flushChanges()
                        }
                    } else {
                        dragActivity.deleteHandler = () => {
                            target.board.removeObject(target)
                        }
                    }

                    dragActivity.interruptHandler = event.forceStop

                    event.nativeEvent.stopPropagation()
                    return [target, position] as const
                },
                onMove(event, [target, state]) {
                    const delta = target.board.snapPoint(new Point(event.deltaX, event.deltaY).mul(target.board.eventScale))
                    if (delta.isZero()) return
                    target.points[index] = state.add(delta).floor().add(0.5, 0.5)
                    target.flushChanges()
                    target.board.updateBounds()
                },
                onMoveEnd(_, [target, state]) {
                    target.board.dragActivity = null

                    if (dragActivity.interrupted) {
                        target.points[index] = state
                        target.flushChanges()
                        target.board.updateBounds()
                        return
                    }

                    if (target == owner) {
                        target.board.undoSteps.push(() => {
                            target.board.select(target)
                            target.points[index] = state
                            target.flushChanges()
                            target.board.updateBounds()
                        })
                    } else {
                        target.board.undoSteps.push(() => {
                            target.board.removeObject(target)
                        })
                    }
                },
            })

            this._element.addEventListener("mousedown", handler)
        }

        return super.getElement()
    }

    public flush(): void {
        const position = this.owner.points[this.index]
        applyPositionAndSize(this.getElement(), position, null, true)
    }

    constructor(
        public readonly owner: LineObject,
        public readonly index: number,
    ) { super(owner) }
}

export class LineObject extends EditableObject {
    public color = ColorProperty.add(this, Color.red)
    public points: Point[] = []
    public width = LineWidthProperty.add(this, LINE_WIDTHS[1])
    public startArrow = StartArrowProperty.add(this, false)
    public endArrow = EndArrowProperty.add(this, true)

    public translate(offset: Point) {
        this.points = this.points.map(v => v.add(offset))
    }

    public override rebuildHandles(): void {
        if (this._handles == null) return
        this._handles = null
        super.rebuildHandles()
    }

    protected _handles: HandleObject[] | null = null
    protected override _getHandles(): HandleObject[] {
        return this._handles ??= [
            new LineOutlineHandle(this),
            ...this.points.map((_, i) => new LineWaypointHandle(this, i)),
            ...this.points.map((_, i) => new LineAddWaypointHandle(this, i)),
            new LineAddWaypointHandle(this, this.points.length),
        ]
    }

    public override teardown(): void {
        super.teardown()

        if (this._marker) {
            this._marker.unref()
            this._marker = null
        }
    }

    protected _element: SVGPolylineElement | null = null
    protected override _getRenderShape(): SVGElement {
        return this._element ??= createSvgElement("polyline")
    }

    protected override _getSelectionElement(): SVGElement {
        if (this._selectionElement == null) {
            const element = super._getSelectionElement()
            element.setAttribute("stroke-width", Math.max(MIN_SELECTABLE_LINE_WIDTH, this.width) + "px")
            element.setAttribute("fill", "none")
        }

        return super._getSelectionElement()
    }

    protected override _flushGeometry(shape: SVGElement): void {
        shape.setAttribute("points", this.points.map(v => `${v.x},${v.y}`).join(" "))
        if (shape == this._getSelectionElement()) {
            shape.setAttribute("stroke-width", Math.max(MIN_SELECTABLE_LINE_WIDTH, this.width) + "px")
        } else {
            shape.setAttribute("stroke-width", `${this.width}px`)
        }
    }

    protected _marker: MarkerObject | null = null
    protected _getMarker() {
        if (this.startArrow || this.endArrow) {
            if (this._marker == null) {
                this._marker = ArrowMarkerObject.getInstance(this.board)
                this._marker.ref()
            }

            return this._marker.getReference()
        } else {
            if (this._marker) {
                this._marker.unref()
                this._marker = null
            }

            return "none"
        }
    }

    protected override _flushStyle(shape: SVGElement): void {
        const marker = this._getMarker()
        shape.setAttribute("marker-start", this.startArrow ? marker : "none")
        shape.setAttribute("marker-end", this.endArrow ? marker : "none")
        shape.setAttribute("stroke", this.color.toHex())
        shape.setAttribute("fill", "none")
    }

    public override duplicate() {
        const clone = super.duplicate()

        clone.points = cloneArray(this.points)

        return clone
    }

    public override getBoundingBox() {
        return Rect.union(this.points)
    }
}
