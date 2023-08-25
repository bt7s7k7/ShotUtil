import { arrayRemove, reverseIterate, shallowClone } from "../comTypes/util"
import { Drawer } from "../drawer/Drawer"
import { Point } from "../drawer/Point"
import { Rect } from "../drawer/Rect"
import { DrawerInput } from "../drawerInput/DrawerInput"
import { EventEmitter } from "../eventLib/EventEmitter"
import { EventListener } from "../eventLib/EventListener"
import { Handle } from "./Handle"
import { Shape } from "./Shape"

export interface ShapeEditorDragState {
    update(pos: Point): void
    end(): void
}

export class ShapeEditor extends EventListener {
    public readonly onPostRender = new EventEmitter()
    public readonly onCursorChange = new EventEmitter<string>()
    public readonly onSelectionChange = new EventEmitter()

    public drawer: Drawer = null!
    public camera = new Drawer.Camera({ shouldCenterView: true })
    protected _handles: Handle[] = []
    protected _shapes: Shape[] = []
    protected _lastMousePos = Point.NaN

    protected _selected: Shape | null = null
    public get selected() { return this._selected }
    public select(shape: Shape | null) {
        if (this._selected == shape) return
        this._selected = shape
        this.onSelectionChange.emit()
    }

    public addShape(shape: Shape) {
        shape.editor = this
        this._shapes.push(shape)
        this.select(shape)
        if (shape.getPos().isNaN()) {
            shape.setPos(this.camera.offset.mul(-1))
        }
    }

    public moveToTop(shape: Shape) {
        arrayRemove(this._shapes, shape)
        this._shapes.push(shape)
    }

    public moveToBack(shape: Shape) {
        arrayRemove(this._shapes, shape)
        this._shapes.unshift(shape)
    }

    public duplicateShape(shape: Shape) {
        const duplicate = shallowClone(shape)
        this.addShape(duplicate)
        return duplicate
    }

    public deleteSelected() {
        if (this._selected == null) return
        arrayRemove(this._shapes, this._selected)
        this.select(null)
    }

    public handleClick(pos: Point) {
        const target = this._queryPoint(pos)

        if (target == null) {
            this.select(null)
        } else if (target instanceof Shape) {
            this.select(target)
        } else {
            target.handleClick?.()
        }
    }

    public handleMouseMove(pos: Point) {
        this._lastMousePos = pos
    }

    public handleDrag(pos: Point): ShapeEditorDragState | null {
        const target = this._queryPoint(pos)

        if (target == null) {
            return null
        } else if (target instanceof Shape) {
            this.select(target)
            const initScreen = pos
            const initWorld = target.getPos()
            return {
                update: (pos) => {
                    const offsetScreen = pos.add(initScreen.mul(-1))
                    const offsetWorld = offsetScreen.mul(1 / this.camera.scale)
                    target.setPos(initWorld.add(offsetWorld))
                },
                end() { }
            }
        } else {
            if (target.handleDrag == null) return null
            const callback = target.handleDrag(pos)

            return {
                update(pos) {
                    callback(pos)
                },
                end() {

                },
            }
        }
    }

    protected _queryPoint(pos: Point) {
        const worldPos = this.camera.screenToWorld.transform(pos)

        for (const handle of reverseIterate(this._handles)) {
            const center = this.camera.worldToScreen.transform(handle.center)
            const testRect = Rect.extends(center, handle.size)

            if (testRect.containsPoint(pos)) {
                return handle
            }
        }

        for (const shape of reverseIterate(this._shapes)) {
            if (shape.testCollision(worldPos)) {
                return shape
            }
        }

        return null
    }

    protected _render() {
        this.drawer = this.drawerInput.drawer
        if (this.drawer == null) return
        this.drawer.setNativeSize()
        this.camera.updateViewport(this.drawer.size.mul(0.5).ceilSize().mul(2))
        this.camera.pushTransform(this.drawer)

        for (const shape of this._shapes) {
            shape.draw()
        }

        this.drawer.restore()

        if (this._selected) {
            this._selected.drawOutline()
            this._handles = this._selected.getHandles()
        } else {
            this._handles = []
        }

        const hover = this._queryPoint(this._lastMousePos)
        this.onCursorChange.emit(hover == null ? "initial" : hover instanceof Shape ? "grab" : hover.cursor != null ? hover.cursor : "initial")

        for (const handle of this._handles) {
            const center = this.camera.worldToScreen.transform(handle.center).floor()
            handle.render(center, this.drawer, hover == handle)
        }

        this.onPostRender.emit()
    }

    constructor(
        public readonly drawerInput: DrawerInput,
    ) {
        super()

        drawerInput.onDraw.add(this, () => {
            this._render()
        })
    }
}
