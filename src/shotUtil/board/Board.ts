import { arrayRemove, unreachable } from "../../comTypes/util"
import { Point } from "../../drawer/Point"
import { BoardObject } from "./BoardObject"
import { createSvgElement } from "./support"

export class DragActivity {
    public interrupted = false

    public interruptHandler: (() => void) | null = null
    public deleteHandler: (() => void) | null = null

    public delete() {
        this.interrupt()
        this.deleteHandler?.()
    }

    public interrupt() {
        this.interrupted = true
        this.interruptHandler?.()
    }
}

export class Board {
    public readonly boardHost: SVGElement
    public readonly renderHost: SVGElement
    public readonly selectionHost: SVGElement
    public readonly controlHost: SVGElement
    public readonly objects: BoardObject[] = []

    public snapGridSize = 10
    public snapPoint(point: Point) {
        return point.mul(1 / this.snapGridSize).floor().mul(this.snapGridSize)
    }

    public dragActivity: DragActivity | null = null

    public undoSteps: (() => void)[] = []
    public undo() {
        const step = this.undoSteps.pop()
        step?.()
    }

    protected _selected: BoardObject | null = null
    public get selected() { return this._selected }
    public select(object: BoardObject | null) {
        if (this._selected == object) return
        this._selected?.setSelectedState(false)
        object?.setSelectedState(true)
        this._selected = object
    }

    public addObjectWithUndo(object: BoardObject) {
        this.addObject(object)
        this.undoSteps.push(() => {
            this.removeObject(object)
        })
    }

    public addObject(object: BoardObject) {
        this.objects.push(object)
        object.init(this)
    }

    public removeObjectWithUndo(object: BoardObject) {
        this.removeObject(object)
        this.undoSteps.push(() => {
            this.addObject(object)
            this.select(object)
        })
    }

    public removeObject(object: BoardObject) {
        if (object == this.selected) {
            this.select(null)
        }

        arrayRemove(this.objects, object) || unreachable()
        object.teardown()
    }

    constructor(
    ) {
        this.boardHost = createSvgElement("svg")
        this.renderHost = createSvgElement("g")
        this.renderHost.dataset.kind = "render"
        this.selectionHost = createSvgElement("g")
        this.selectionHost.dataset.kind = "selection"
        this.controlHost = createSvgElement("g")
        this.controlHost.dataset.kind = "control"

        this.boardHost.append(this.renderHost, this.selectionHost, this.controlHost)

        this.boardHost.addEventListener("click", () => {
            this.select(null)
        })
    }
}
