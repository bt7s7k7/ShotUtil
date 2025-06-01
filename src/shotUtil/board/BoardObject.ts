import { Constructor } from "../../comTypes/types"
import { Rect } from "../../drawer/Rect"
import { Board } from "./Board"

export abstract class BoardObject {
    public board: Board = null!

    public abstract setSelectedState(selected: boolean): void
    public abstract flushChanges(): void
    public init(board: Board) {
        this.board = board
    }
    public teardown() { }

    public abstract moveToBack(): void
    public abstract moveToFront(): void
    public abstract getBoundingBox(): Rect | null

    public duplicate() {
        const clone = new (this.constructor as Constructor<this>)()

        for (const symbol of Object.getOwnPropertySymbols(this)) {
            if (symbol.toString().startsWith("Symbol(shot-util.property.")) {
                // @ts-ignore
                clone[symbol].value = this[symbol].value
            }
        }

        return clone
    }
}
