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

    public drawer: Drawer = null!
    public camera = new Drawer.Camera({ shouldCenterView: true })
    protected _handles: Handle[] = []
    protected _shapes: Shape[] = []
    protected _selected: Shape | null = null
    protected _lastMousePos = Point.NaN

    public addShape(shape: Shape) {
        shape.editor = this
        this._shapes.push(shape)
    }

    public handleClick(pos: Point) {
        const target = this._queryPoint(pos)

        if (target == null) {
            this._selected = null
        } else if (target instanceof Shape) {
            this._selected = target
        } else {
            target.handleClick?.()
        }
    }

    public handleMouseMove(pos: Point) {
        this._lastMousePos = this.camera.screenToWorld.transform(pos)
    }

    public handleDrag(pos: Point): ShapeEditorDragState | null {
        const target = this._queryPoint(pos)

        if (target == null) {
            return null
        } else if (target instanceof Shape) {
            this._selected = target
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

        for (const handle of this._handles) {
            const center = this.camera.worldToScreen.transform(handle.center)
            const testRect = Rect.extends(center, handle.size)

            if (testRect.containsPoint(pos)) {
                return handle
            }
        }

        for (const shape of this._shapes) {
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
        this.camera.updateViewport(this.drawer.size)
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
        for (const handle of this._handles) {
            const center = this.camera.worldToScreen.transform(handle.center)
            handle.render(center, this.drawer, hover == handle)
        }

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
