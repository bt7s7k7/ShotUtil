import { shallowReactive } from "vue"
import { arrayRemove, autoFilter, unreachable } from "../../comTypes/util"
import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { BoardObject } from "./BoardObject"
import { applyPositionAndSize, createSvgElement } from "./support"

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
    public readonly boundsObject: SVGRectElement
    public readonly objects: BoardObject[] = []

    public bounds = Rect.zero

    public snapGridSize = 10
    public snapPoint(point: Point) {
        return point.mul(1 / this.snapGridSize).floor().mul(this.snapGridSize)
    }

    public eventScale = 1

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
        object.flushChanges()
        this.updateBounds()
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
        this.updateBounds()
    }

    public getBoundingBox() {
        const bounds = autoFilter(this.objects.map(v => v.getBoundingBox()))
        if (bounds.length == 0) return Rect.zero
        return Rect.union(bounds)
    }

    public updateBounds() {
        this.bounds = this.getBoundingBox()
        applyPositionAndSize(this.boundsObject, this.bounds.center(), this.bounds.size(), true)
    }

    public export() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${this.bounds.x} ${this.bounds.y} ${this.bounds.width} ${this.bounds.height}">${this.renderHost.innerHTML}</svg>`
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

        const self = shallowReactive(this)

        this.boardHost.addEventListener("click", () => {
            self.select(null)
        })

        this.boundsObject = createSvgElement("rect")
        this.boundsObject.setAttribute("fill", "none")
        this.boundsObject.setAttribute("stroke", "#555555")
        this.boundsObject.setAttribute("stroke-dasharray", "5 5")
        this.boardHost.insertBefore(this.boundsObject, this.boardHost.firstChild)

        return self
    }
}
