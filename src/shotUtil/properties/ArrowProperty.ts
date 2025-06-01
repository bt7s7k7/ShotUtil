import { BoardObject } from "../board/BoardObject"
import { Property } from "./Property"

export class StartArrowProperty extends Property<boolean, { startArrow: boolean } & BoardObject> {
    public get value() {
        return this.owner.startArrow
    }

    public set value(value) {
        this.owner.startArrow = value
        if (this.owner.board) this.owner.flushChanges()
    }
}

export class EndArrowProperty extends Property<boolean, { endArrow: boolean } & BoardObject> {
    public get value() {
        return this.owner.endArrow
    }

    public set value(value) {
        this.owner.endArrow = value
        if (this.owner.board) this.owner.flushChanges()
    }
}
