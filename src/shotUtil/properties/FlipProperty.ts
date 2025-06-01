import { BoardObject } from "../board/BoardObject"
import { Property } from "./Property"

export class FlipXProperty extends Property<boolean, { flipX: boolean } & BoardObject> {
    public get value() {
        return this.owner.flipX
    }

    public set value(value) {
        this.owner.flipX = value
        if (this.owner.board) this.owner.flushChanges()
    }
}

export class FlipYProperty extends Property<boolean, { flipY: boolean } & BoardObject> {
    public get value() {
        return this.owner.flipY
    }

    public set value(value) {
        this.owner.flipY = value
        if (this.owner.board) this.owner.flushChanges()
    }
}
