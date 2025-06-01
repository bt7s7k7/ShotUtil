import { BoardObject } from "../board/BoardObject"
import { Property } from "./Property"

export const LINE_WIDTHS = [
    1, 3, 5, 7, 11, 13,
]

export class LineWidthProperty extends Property<number, { width: number } & BoardObject> {
    public get value() {
        return this.owner.width
    }

    public set value(value) {
        this.owner.width = value
        if (this.owner.board) this.owner.flushChanges()
    }

    public get index() { return LINE_WIDTHS.indexOf(this.value) }
    public set index(value) { this.value = LINE_WIDTHS[value] }
}
