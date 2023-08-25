import { Drawer } from "../drawer/Drawer"
import { Point } from "../drawer/Point"

export interface Handle {
    center: Point
    size: Point
    cursor?: string
    render(center: Point, ctx: Drawer, hover: boolean): void
    handleDrag?(start: Point): (pos: Point) => void
    handleClick?(): void
    handleDelete?(): void
}
