import { Board } from "../board/Board"
import { BoardObject } from "../board/BoardObject"
import { createSvgElement } from "../board/support"

const _OWNER = Symbol.for("shot-util.marker-object")

export abstract class MarkerObject extends BoardObject {
    protected _refCount = 0

    public getReference() {
        return `url(#${(this.constructor as typeof MarkerObject)._id})`
    }

    public ref() {
        this._refCount++
    }

    public unref() {
        this._refCount--
        if (this._refCount <= 0) {
            this.board.removeObject(this)
        }
    }

    protected _markerElement: SVGMarkerElement | null = null
    protected _getMarkerElement() {
        if (this._markerElement == null) {
            this._markerElement = createSvgElement("marker")
            this._markerElement.id = (this.constructor as typeof MarkerObject)._id

            for (const [key, value] of Object.entries(this._markerOptions)) {
                this._markerElement.setAttribute(key, value)
            }
        }

        return this._markerElement
    }

    protected abstract _getRenderElement(): SVGElement

    public override init(board: Board) {
        super.init(board)
        const marker = this._getMarkerElement()
        const render = this._getRenderElement()
        marker.append(render)
        board.renderHost.append(marker);
        (marker as any)[_OWNER] = this
    }

    public override teardown() {
        super.teardown()
        this._getMarkerElement().remove()
    }

    public setSelectedState(selected: boolean) { }
    public flushChanges() { }

    constructor(
        protected readonly _markerOptions: Record<string, string>,
    ) { super() }

    public static getInstance<T extends typeof MarkerObject>(this: T, board: Board) {
        const existing = board.renderHost.querySelector("#" + this._id)
        if (existing) {
            return (existing as any)[_OWNER] as InstanceType<T>
        } else {
            const marker = new (this as any)() as InstanceType<T>
            board.addObject(marker)
            return marker
        }
    }

    protected static readonly _id: string
}
