import { Color } from "../../drawer/Color"
import { Point } from "../../drawer/Point"
import { useGrab } from "../../vue3gui/useGrab"
import { DragActivity } from "../board/Board"
import { applyPositionAndSize, createSvgElement, PRIMARY_COLOR, SECONDARY_COLOR, TRANSPARENT } from "../board/support"
import { DotHandleObject } from "../editable/DotHandleObject"
import { EditableObject } from "../editable/EditableObject"
import { HandleObject } from "../editable/HandleObject"
import { ColorProperty } from "../properties/ColorProperty"
import { FillProperty } from "../properties/FillProperty"

export class OutlineHandle extends HandleObject {
    protected _element: SVGRectElement | null = null
    public override getElement(): SVGElement {
        if (this._element == null) {
            this._element = createSvgElement("rect")

            if (this.primary) {
                this._element.setAttribute("stroke", PRIMARY_COLOR)
                this._element.setAttribute("stroke-dasharray", "5 5")
            } else {
                this._element.setAttribute("stroke", SECONDARY_COLOR)
            }

            this._element.setAttribute("fill", TRANSPARENT)

            const dragActivity = new DragActivity()
            const owner = this.owner
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
                    return [target, owner.position] as const
                },
                onMove(event, [target, state]) {
                    const delta = target.board.snapPoint(new Point(event.deltaX, event.deltaY).mul(target.board.eventScale))
                    if (delta.isZero()) return
                    target.position = state.add(delta)
                    target.flushChanges()
                },
                onMoveEnd(_, [target, state]) {
                    target.board.dragActivity = null

                    if (dragActivity.interrupted) {
                        target.position = state
                        target.flushChanges()
                        return
                    }

                    if (target == owner) {
                        target.board.undoSteps.push(() => {
                            target.board.select(target)
                            target.position = state
                            target.flushChanges()
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
        const { position, size } = this.owner
        applyPositionAndSize(this.getElement(), position, size, true)
    }

    constructor(
        public readonly owner: ShapeObject,
        public readonly primary: boolean,
    ) { super(owner) }
}

export class ResizeHandle extends DotHandleObject {
    public override getElement(): SVGElement {
        if (this._element == null) {
            this._element = super.getElement() as SVGCircleElement
            this._element.style.cursor = this.cursor

            const dragActivity = new DragActivity()
            const { owner, direction } = this
            const handler = useGrab({
                cursor: this.cursor,
                onMoveStart(event) {
                    owner.board.dragActivity = dragActivity
                    dragActivity.interrupted = false
                    dragActivity.deleteHandler = () => {
                        owner.board.removeObjectWithUndo(owner)
                    }
                    dragActivity.interruptHandler = event.forceStop

                    event.nativeEvent.stopPropagation()
                    return [owner.position, owner.size]
                },
                onMove(event, [position, size]) {
                    const delta = owner.board.snapPoint(new Point(event.deltaX, event.deltaY).mul(owner.board.eventScale))
                    if (delta.isZero()) return

                    let newSize = owner.size
                    let newPosition = owner.position
                    for (const i of ["x", "y"] as const) {
                        const mul = direction[i]
                        if (mul == 0) continue

                        if (mul > 0) {
                            newSize = newSize.with(i, size[i] + delta[i])
                            newPosition = newPosition.with(i, position[i] + delta[i] * 0.5)
                        } else {
                            newSize = newSize.with(i, size[i] - delta[i])
                            newPosition = newPosition.with(i, position[i] + delta[i] * 0.5)
                        }
                    }
                    if (newSize.x < 10) {
                        newSize = newSize.with("x", 10)
                        newPosition = newPosition.with("x", owner.position.x)
                    }

                    if (newSize.y < 10) {
                        newSize = newSize.with("y", 10)
                        newPosition = newPosition.with("y", owner.position.y)
                    }

                    owner.size = newSize
                    owner.position = newPosition
                    owner.flushChanges()
                },
                onMoveEnd(_, [position, size]) {
                    owner.board.dragActivity = null

                    if (dragActivity.interrupted) {
                        owner.position = position
                        owner.size = size
                        owner.flushChanges()
                        return
                    }

                    owner.board.undoSteps.push(() => {
                        owner.board.select(owner)
                        owner.position = position
                        owner.size = size
                        owner.flushChanges()
                    })
                },
            })

            this._element.addEventListener("mousedown", handler)
        }
        return super.getElement()
    }

    public override flush(): void {
        const { position, size } = this.owner
        const alignedPosition = this.direction.mul(0.5).scale(size).add(position)
        applyPositionAndSize(this.getElement(), alignedPosition, null, true)
    }

    constructor(
        public readonly owner: ShapeObject,
        public readonly direction: Point,
        public readonly cursor: string,
    ) { super(owner) }
}


export abstract class ShapeObject extends EditableObject {
    public color = ColorProperty.add(this, Color.white)
    public fill = FillProperty.add(this, true)
    public position: Point = Point.zero
    public size: Point = Point.zero

    protected _handles: HandleObject[] | null = null
    protected override _getHandles(): HandleObject[] {
        return this._handles ??= [
            new OutlineHandle(this, false),
            new OutlineHandle(this, true),
            new ResizeHandle(this, Point.up, "n-resize"),
            new ResizeHandle(this, Point.right, "e-resize"),
            new ResizeHandle(this, Point.down, "s-resize"),
            new ResizeHandle(this, Point.left, "w-resize"),
            new ResizeHandle(this, Point.up.add(Point.right), "ne-resize"),
            new ResizeHandle(this, Point.right.add(Point.down), "se-resize"),
            new ResizeHandle(this, Point.down.add(Point.left), "sw-resize"),
            new ResizeHandle(this, Point.left.add(Point.up), "nw-resize"),
        ]
    }

    protected override _getSelectionElement(): SVGElement {
        if (this._selectionElement == null) {
            super._getSelectionElement().setAttribute("stroke-width", "4px")
        }

        return super._getSelectionElement()
    }

    protected override _flushGeometry(shape: SVGElement): void {

        if (shape == this._getSelectionElement()) {
            if (this.fill) {
                shape.setAttribute("stroke-width", "3")
                shape.setAttribute("fill", TRANSPARENT)
                applyPositionAndSize(shape, this.position, this.size, false)
            } else {
                shape.setAttribute("stroke-width", "8")
                shape.setAttribute("fill", "none")
                applyPositionAndSize(shape, this.position, this.size.add(-4, -4), true)
            }
        } else {
            applyPositionAndSize(shape, this.position, this.size, !this.fill)
        }
    }

    protected override _flushStyle(shape: SVGElement): void {
        shape.setAttribute("stroke-width", "3")

        if (this.fill) {
            shape.setAttribute("stroke", "none")
            shape.setAttribute("fill", this.color.toHex())
        } else {
            shape.setAttribute("stroke", this.color.toHex())
            shape.setAttribute("fill", "none")
        }
    }

    public override duplicate() {
        const clone = super.duplicate()

        clone.position = this.position
        clone.size = this.size

        return clone
    }

    constructor() {
        super()
    }
}
