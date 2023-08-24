import { Color } from "../../drawer/Color"
import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { Handle } from "../Handle"
import { Shape } from "../Shape"

export abstract class BoxShape extends Shape {
    public keepAspectRatio = false

    public getHandles() {
        const makeScaleHandle = (direction: Point, cursor: string): Handle => {
            const directionUV = direction.add(1, 1).mul(0.5)
            const center = directionUV.scale(this.rect.size()).add(this.rect.pos())
            const radius = 5
            const size = new Point(radius * 2, radius * 2)
            return {
                center, size, cursor,
                render: (center, ctx, hover) => {
                    ctx
                        .beginPath()
                        .arc(center, 3)
                        .setStyle(Color.white)
                        .fill()
                        .setStyle(Color.cyan)
                        .stroke()
                },
                handleDrag: (pos) => {
                    const initSize = this.rect.size()
                    const initPos = this.rect.pos()

                    const worldToScreen = this.editor.camera.worldToScreen
                    const centerScreen = worldToScreen.transform(center)

                    return (pos) => {
                        const start = direction.mul(-1).add(1, 1).mul(0.5).scale(initSize).add(initPos)
                        const startScreen = worldToScreen.transform(start)

                        let newSize = initSize
                        const posRelative = pos.add(startScreen.mul(-1))
                        if (this.keepAspectRatio) {

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

                        if (this.keepAspectRatio) {
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

                        this.rect = new Rect(newPos, newSize)
                    }
                },
            }
        }

        return [
            makeScaleHandle(new Point(1, 0), "e-resize"),
            makeScaleHandle(new Point(-1, 0), "w-resize"),
            makeScaleHandle(new Point(0, 1), "s-resize"),
            makeScaleHandle(new Point(0, -1), "n-resize"),
            makeScaleHandle(new Point(1, 1), "se-resize"),
            makeScaleHandle(new Point(1, -1), "ne-resize"),
            makeScaleHandle(new Point(-1, 1), "sw-resize"),
            makeScaleHandle(new Point(-1, -1), "nw-resize"),
        ]
    }

    public testCollision(point: Point) {
        return this.rect.containsPoint(point)
    }

    public drawOutline(): void {
        const rect = this.editor.camera.worldToScreen.transformRect(this.rect).makePixelPerfect()

        this.editor.drawer
            .setStyle(Color.black).strokeRect(rect)
            .setStyle(Color.cyan).setLineDash([5, 5]).strokeRect(rect)
            .setLineDash(null)
    }

    public getPos() {
        return this.rect.pos()
    }

    public setPos(newPos: Point) {
        this.rect = new Rect(newPos, this.rect.size())
    }

    constructor(
        public rect: Rect
    ) { super() }
}
