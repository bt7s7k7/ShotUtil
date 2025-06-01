import { BoardObject } from "../board/BoardObject"
import { Property } from "./Property"

export class FillProperty extends Property<boolean, { fill: boolean } & BoardObject> {
    public get value() {
        return this.owner.fill
    }

    public set value(value) {
        this.owner.fill = value
        this.owner.flushChanges()
    }
}
