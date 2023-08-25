import { Drawer } from "../../drawer/Drawer"
import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { BoxShape } from "./BoxShape"

export class ImageShape extends BoxShape {
    public draw() {
        this.editor.drawer.save()
        this.editor.drawer.translate(this.rect.pos())

        if (this.rect.width < 0) {
            this.editor.drawer.scale(new Point(-1, 1)).translate(new Point(-this.rect.width, 0))
        }

        if (this.rect.height < 0) {
            this.editor.drawer.scale(new Point(1, -1)).translate(new Point(0, -this.rect.height))
        }

        this.editor.drawer.blit(this.source, new Rect(Point.zero, this.rect.size()))
        this.editor.drawer.restore()
    }

    public flip(axis: "x" | "y") {
        const size = this.rect.size()
        const pos = this.rect.pos()

        const sizeAxis = size[axis]
        const posAxis = pos[axis]

        const newSize = size.with(axis, sizeAxis * -1)
        const newPos = pos.with(axis, posAxis + sizeAxis)

        this.rect = new Rect(newPos, newSize)
    }

    constructor(
        public readonly pos: Point,
        public readonly source: Drawer
    ) {
        super(Rect.extends(pos, source.size.size()))
        this.keepAspectRatio = true
    }
}
