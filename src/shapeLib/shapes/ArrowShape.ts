import { autoFilter } from "../../comTypes/util"
import { Color } from "../../drawer/Color"
import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { Handle } from "../Handle"
import { Shape } from "../Shape"
import { ShapeUtil } from "../ShapeUtil"

export class ArrowShape extends Shape {
    public segments: Point[] = []
    public color = Color.red

    public arrowStart = false
    public arrowEnd = true

    public draw(): void {
        this.editor.drawer
            .save()
            .beginPath()
            .shape(this.segments)

        const drawArrow = (center: Point, dir: Point) => {
            const arrowSize = 12

            this.editor.drawer
                .move(center.add(dir.mul(-1.25).add(dir.tangent()).mul(arrowSize)))
                .lineTo(center)
                .lineTo(center.add(dir.mul(-1.25).add(dir.tangent().mul(-1)).mul(arrowSize)))
        }

        if (this.arrowStart) {
            drawArrow(this.segments[0], this.segments[0].add(this.segments[1].mul(-1)).normalize())
        }

        if (this.arrowEnd) {
            drawArrow(this.segments[this.segments.length - 1], this.segments[this.segments.length - 1].add(this.segments[this.segments.length - 2].mul(-1)).normalize())
        }

        this.editor.drawer
            .setStyle(this.color)
            .setStrokeWidth(3)
            .stroke()
            .restore()
    }

    public drawOutline(): void {
        this.editor.drawer
            .beginPath().shape(this.segments.map(v => this.editor.camera.worldToScreen.transform(v)))
            .use(ShapeUtil.drawOutline)
    }

    public testCollision(point: Point): boolean {
        for (let i = 1; i < this.segments.length; i++) {
            const start = this.segments[i - 1]
            const end = this.segments[i]
            const line = end.add(start.mul(-1))
            const lineLength = line.size()
            const direction = line.mul(1 / lineLength)
            const projected = Point.project(start, direction, point).pointClamped(lineLength)
            const dist = projected.dist(point)

            if (dist < 5) {
                return true
            }
        }

        return false
    }

    public getBoundingBox(): Rect {
        return Rect.union(this.segments.map(v => Rect.extends(v, Point.one.mul(10))))
    }

    public getHandles(): Handle[] {
        let index = 0

        const createAddHandle = (i: number, center: Point): Handle => {
            return {
                center, cursor: "grab",
                size: Point.one.mul(10),
                render(center, ctx, hover) {
                    ctx.use(ShapeUtil.drawHandleTransparent, center)
                },
                handleDrag: (start) => {
                    index = i
                    this.segments.splice(index, 0, this.editor.camera.screenToWorld.transform(start))

                    return (pos) => {
                        if (index == -1) return
                        this.segments[index] = this.editor.camera.screenToWorld.transform(pos)
                    }
                },
                handleDelete: () => {
                    this.segments.splice(index, 1)
                    index = -1
                }
            }
        }

        return autoFilter<Handle>(this.segments.flatMap((pos, i) => {
            return [
                i != 0 && createAddHandle(i, this.segments[i].add(this.segments[i - 1]).mul(0.5)),
                i == 0 && createAddHandle(i, pos.add(this.segments[i + 1].add(pos.mul(-1)).normalize().mul(1 / this.editor.camera.scale * -10))),
                i == this.segments.length - 1 && createAddHandle(i + 1, pos.add(this.segments[i - 1].add(pos.mul(-1)).normalize().mul(1 / this.editor.camera.scale * -10))),
                {
                    center: pos,
                    cursor: "grab",
                    size: Point.one.mul(10),
                    render(center, ctx, hover) {
                        ctx.use(ShapeUtil.drawHandle, center)
                    },
                    handleDrag: (start) => {
                        const initPos = pos
                        const initScreen = start
                        index = i

                        return (pos) => {
                            if (index == -1) return
                            const offset = pos.add(initScreen.mul(-1))
                            const offsetWorld = offset.mul(1 / this.editor.camera.scale)

                            this.segments[index] = initPos.add(offsetWorld)
                        }
                    },
                    handleDelete: () => {
                        if ((i == 0 || i == this.segments.length - 1) && this.segments.length == 2) return
                        this.segments.splice(index, 1)
                        index = -1
                    }
                }
            ]
        }))
    }

    public setPos(newPos: Point): void {
        if (this.segments.length == 0) {
            this.segments.push(
                newPos.add(-40, -40),
                newPos.add(40, 40)
            )

            return
        }

        const center = this.getPos()
        const offset = newPos.add(center.mul(-1))
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i] = this.segments[i].add(offset)
        }
    }

    public getPos() {
        if (this.segments.length == 0) return Point.NaN

        return this.segments.reduce((a, b) => a.add(b)).mul(1 / this.segments.length)
    }

    public clone() {
        const clone = super.clone()
        clone.segments = [...clone.segments]
        return clone
    }

    constructor() {
        super()
    }
}
