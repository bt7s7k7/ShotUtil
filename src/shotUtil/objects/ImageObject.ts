import { Point } from "../../drawer/Point"
import { applyPositionAndSize, createSvgElement } from "../board/support"
import { ShapeObject } from "./ShapeObject"

export class ImageObject extends ShapeObject {
    public src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACdJREFUKFNj/M/w/z8DGmBkYEQXYmAcCgoZGBgwPPMfUwjsvcGuEABTfx33POuuvQAAAABJRU5ErkJggg=="
    public nativeSize = Point.zero

    protected _renderElement: SVGImageElement | null = null
    protected _getRenderShape(): SVGElement {
        return this._renderElement ??= createSvgElement("image")
    }

    protected override _flushGeometry(shape: SVGElement): void {
        if (shape == this._getRenderShape()) {
            let { position, size } = this

            if (size.dist(this.nativeSize) < this.board.snapGridSize * 1.5) {
                size = this.nativeSize
            } else {
                const extend = size.antiScale(this.nativeSize)
                if (extend.x > extend.y) {
                    size = new Point(this.nativeSize.x * extend.y, size.y)
                } else {
                    size = new Point(size.x, this.nativeSize.y * extend.x)
                }
            }

            applyPositionAndSize(shape, position, size, false)
            return
        }

        super._flushGeometry(shape)
    }

    protected override _flushStyle(shape: SVGElement): void {
        if (shape == this._renderElement) {
            this._renderElement.setAttribute("href", this.src)
        }
    }

    public override duplicate() {
        const clone = super.duplicate()

        clone.src = this.src
        clone.nativeSize = this.nativeSize

        return clone
    }

}
