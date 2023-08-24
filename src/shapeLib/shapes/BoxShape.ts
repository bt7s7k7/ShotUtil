import { Color } from "../../drawer/Color"
import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { Handle } from "../Handle"
import { Shape } from "../Shape"

export abstract class BoxShape extends Shape {
    public getHandles() {
        const makeScaleHandle = (direction: Point): Handle => {
            const directionUV = direction.add(1, 1).mul(0.5)
            const center = directionUV.scale(this.rect.size()).add(this.rect.pos())
            const radius = 3
            const size = new Point(radius * 2, radius * 2)
            return {
                center, size,
                render: (center, ctx, hover) => {
                    ctx
                        .beginPath()
                        .arc(center, radius)
                        .setStyle(Color.white)
                        .fill()
                        .setStyle(Color.cyan)
                        .stroke()
                },
                handleDrag: (pos) => {
                    const initScreen = pos
                    const initSize = this.rect.size()
                    const initPos = this.rect.pos()

                    const worldToScreen = this.editor.camera.worldToScreen
                    const centerScreen = worldToScreen.transform(center)

                    return (pos) => {
                        const start = direction.mul(-1).add(1, 1).mul(0.5).scale(this.rect.size()).add(this.rect.pos())
                        const startScreen = worldToScreen.transform(start)
                        const line = centerScreen.add(startScreen.mul(-1))
                        const lineSize = line.size()
                        const lineDirection = line.mul(1 / lineSize)

                        const posRelative = pos.add(startScreen.mul(-1))
                        let frac = Point.dot(posRelative, lineDirection) / lineSize
                        if (Math.abs(frac) < 1e-5) frac = Math.sign(frac) * 1e-5

                        let newSize = initSize.mul(frac)
                        if (Math.abs(newSize.x) < 10 || Math.abs(newSize.y) < 10) {
                            const ratio = 10 / Math.min(Math.abs(newSize.x), Math.abs(newSize.y))
                            newSize = newSize.mul(ratio)
                        }
                        const correction = Point.one.add(directionUV.mul(-1)).scale(initSize.add(newSize.mul(-1)))
                        const newPos = initPos.add(correction)

                        this.rect = new Rect(newPos, newSize)
                    }
                },
            }
        }

        return [
            makeScaleHandle(new Point(1, 0)),
            makeScaleHandle(new Point(-1, 0)),
            makeScaleHandle(new Point(0, 1)),
            makeScaleHandle(new Point(0, -1)),
            makeScaleHandle(new Point(1, 1)),
            makeScaleHandle(new Point(1, -1)),
            makeScaleHandle(new Point(-1, 1)),
            makeScaleHandle(new Point(-1, -1)),
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
