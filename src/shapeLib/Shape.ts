import { Drawer } from "../drawer/Drawer"
import { Point } from "../drawer/Point"
import { Handle } from "./Handle"
import { ShapeEditor } from "./ShapeEditor"

export abstract class Shape {
    public editor: ShapeEditor = null!

    public abstract testCollision(point: Point): boolean
    public abstract draw(): void
    public abstract drawOutline(): void
    public abstract getHandles(): Handle[]
    public abstract getPos(): Point
    public abstract setPos(newPos: Point): void

    public translate(offset: Point) {
        this.setPos(this.getPos().add(offset))
    }
}
