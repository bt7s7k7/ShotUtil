import { Color } from "../../drawer/Color"
import { BoardObject } from "../board/BoardObject"
import { Property } from "./Property"

export const COLORS = [
    Color.white,
    Color.white.mul(0.75),
    Color.white.mul(0.5),
    Color.white.mul(0.25),
    Color.black,
    Color.red,
    Color.yellow,
    Color.green,
    Color.cyan,
    Color.blue,
    Color.magenta,
]

export class ColorProperty extends Property<Color, { color: Color } & BoardObject> {
    public get value() {
        return this.owner.color
    }

    public set value(value) {
        this.owner.color = value
        this.owner.flushChanges()
    }
}
