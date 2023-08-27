import { Color } from "../drawer/Color"
import { Drawer } from "../drawer/Drawer"
import { Matrix } from "../drawer/Matrix"
import { Point } from "../drawer/Point"
import { Rect } from "../drawer/Rect"
import { Handle } from "./Handle"

export namespace ShapeUtil {
    export function drawHandle(ctx: Drawer, center: Point) {
        ctx
            .beginPath()
            .arc(center, 3)
            .setStyle(Color.white)
            .fill()
            .setStyle(Color.cyan)
            .stroke()
    }

    export function drawHandleTransparent(ctx: Drawer, center: Point) {
        ctx
            .beginPath()
            .arc(center, 3)
            .setStyle(Color.cyan)
            .stroke()
    }

    export function drawOutline(ctx: Drawer) {
        ctx
            .setStyle(Color.black).stroke()
            .setStyle(Color.cyan).setLineDash([5, 5]).stroke()
            .setLineDash(null)
    }

    export interface ScaleHandleOptions {
        direction: Point
        cursor: string
        rect: Rect
        keepAspectRatio: boolean
        worldToScreen: Matrix
        callback: (newRect: Rect) => void
    }
    export function makeScaleHandle({ direction, cursor, rect, keepAspectRatio, worldToScreen, callback }: ScaleHandleOptions): Handle {
        const directionUV = direction.add(1, 1).mul(0.5)
        const center = directionUV.scale(rect.size()).add(rect.pos())
        const radius = 5
        const size = new Point(radius * 2, radius * 2)
        return {
            center, size, cursor,
            render: (center, ctx, hover) => {
                ctx.use(ShapeUtil.drawHandle, center)
            },
            handleDrag: (pos) => {
                const initSize = rect.size()
                const initPos = rect.pos()

                const centerScreen = worldToScreen.transform(center)

                return (pos) => {
                    const start = direction.mul(-1).add(1, 1).mul(0.5).scale(initSize).add(initPos)
                    const startScreen = worldToScreen.transform(start)

                    let newSize = initSize
                    const posRelative = pos.add(startScreen.mul(-1))
                    if (keepAspectRatio) {

                        const line = centerScreen.add(startScreen.mul(-1))
                        const lineSize = line.size()
                        const lineDirection = line.mul(1 / lineSize)

                        let frac = Point.dot(posRelative, lineDirection) / lineSize
                        if (Math.abs(frac) < 1e-5) frac = Math.sign(frac) * 1e-5

                        newSize = initSize.mul(frac)
                    } else {
                        newSize = posRelative.scale(direction)
                        if (direction.x == 0) {
                            newSize = newSize.with("x", initSize.x)
                        }

                        if (direction.y == 0) {
                            newSize = newSize.with("y", initSize.y)
                        }
                    }

                    if (newSize.x == 0) newSize = newSize.with("x", 1e-5)
                    if (newSize.y == 0) newSize = newSize.with("y", 1e-5)

                    if (keepAspectRatio) {
                        if (Math.abs(newSize.x) < 10 || Math.abs(newSize.y) < 10) {
                            const ratio = 10 / Math.min(Math.abs(newSize.x), Math.abs(newSize.y))
                            newSize = newSize.mul(ratio)
                        }
                    } else {
                        if (Math.abs(newSize.x) < 10) {
                            const ratio = 10 / Math.abs(newSize.x)
                            newSize = newSize.with("x", newSize.x * ratio)
                        }

                        if (Math.abs(newSize.y) < 10) {
                            const ratio = 10 / Math.abs(newSize.y)
                            newSize = newSize.with("y", newSize.y * ratio)
                        }
                    }


                    const correction = Point.one.add(directionUV.mul(-1)).scale(initSize.add(newSize.mul(-1)))
                    const newPos = initPos.add(correction).floor()

                    callback(new Rect(newPos, newSize))
                }
            },
        }
    }
}
