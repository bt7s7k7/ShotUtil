import { Color } from "../../drawer/Color"
import { Drawer } from "../../drawer/Drawer"
import { Point } from "../../drawer/Point"
import { Rect } from "../../drawer/Rect"
import { BoxShape } from "./BoxShape"

export class ImageShape extends BoxShape {
    public cropRect

    public draw() {
        this.editor.drawer.save()
        this.editor.drawer.translate(this.rect.pos())

        if (this.rect.width < 0) {
            this.editor.drawer.scale(new Point(-1, 1)).translate(new Point(-this.rect.width, 0))
        }

        if (this.rect.height < 0) {
            this.editor.drawer.scale(new Point(1, -1)).translate(new Point(0, -this.rect.height))
        }

        this.editor.drawer.blit(this.source, new Rect(Point.zero, this.rect.size()), this.cropRect)
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

    public crop() {
        const cropShape = new ImageCropShape(this.source, this, Rect.union([this.rect]), this.cropRect)
        this.editor.select(cropShape)
        this.cropRect = this.source.size
        this.rect = cropShape.fullRect
    }

    constructor(
        public readonly source: Drawer
    ) {
        super(Rect.extends(Point.NaN, source.size.size()))
        this.keepAspectRatio = true
        this.cropRect = source.size
    }
}

class ImageCropShape extends ImageShape {
    public readonly fullRect
    public readonly scale

    public isModal() {
        return true
    }

    public modalAccept() {
        this.owner.rect = this.rect
        this.owner.cropRect = this.cropRect
        this.editor.select(this.owner)
    }

    public modalCancel() {
        this.owner.rect = this.initialRect
        this.owner.cropRect = this.initialCrop
        this.editor.select(this.owner)
    }

    public setPos(newPos: Point): void {

    }

    public drawOutline() {
        this.editor.drawer
            .setStyle(Color.white)
            .strokeRect(this.editor.camera.worldToScreen.transformRect(this.fullRect).makePixelPerfect())

        super.drawOutline()
    }

    protected _scaleCallback(rect: Rect, initRect: Rect): void {
        for (const axis of ["width", "height"] as const) {
            if (Math.sign(rect[axis]) != Math.sign(initRect[axis])) {
                return
            }
        }

        this.rect = rect

        for (const axis of ["x", "y"] as const) {
            if (this.rect[axis] < this.fullRect[axis]) {
                const diff = this.fullRect[axis] - this.rect[axis]
                this.rect = this.rect.translate(axis == "x" ? diff : 0, axis == "y" ? diff : 0).expand(axis == "x" ? -diff : 0, axis == "y" ? -diff : 0)
            }

            if (this.rect.end()[axis] > this.fullRect.end()[axis]) {
                const diff = this.fullRect.end()[axis] - this.rect.end()[axis]
                this.rect = this.rect.expand(axis == "x" ? diff : 0, axis == "y" ? diff : 0)
            }
        }

        const offset = this.rect.pos().add(this.fullRect.pos().mul(-1)).mul(1 / this.scale)
        const size = this.rect.size().mul(1 / this.scale)
        this.cropRect = new Rect(offset, size)
    }

    constructor(
        source: Drawer,
        public readonly owner: ImageShape,
        public readonly initialRect: Rect,
        public readonly initialCrop: Rect
    ) {
        super(source)

        this.keepAspectRatio = false
        this.rect = initialRect
        this.cropRect = initialCrop

        this.scale = this.rect.width / this.cropRect.width
        this.fullRect = new Rect(this.rect.pos().add(this.cropRect.pos().mul(-this.scale)), this.source.size.size().mul(this.scale))
    }
}
