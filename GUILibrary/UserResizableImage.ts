import { UserResizable } from "./UserResizable.js";
import { Point, Rect } from "./GUI.js";

export class UserResizableImage extends UserResizable {
    protected image: CanvasImageSource
    public cropRect: Rect
    public scale = new Point(1, 1)

    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        var screenRect = this.getScreenRect(offset)
        screenRect.x = Math.floor(screenRect.x)
        screenRect.y = Math.floor(screenRect.y)
        ctx.save()
        ctx.scale(...this.scale.spread())
        ctx.drawImage(
            this.image,
            this.cropRect.x,
            this.cropRect.y,
            this.cropRect.width,
            this.cropRect.height,
            screenRect.x * this.scale.x,
            screenRect.y * this.scale.y,
            screenRect.width * this.scale.x,
            screenRect.height * this.scale.y
        )
        ctx.restore()
        super.draw(offset, ctx)
    }

    setImage(source: CanvasImageSource) {
        this.image = source
        this.cropRect = new Rect(0, 0,
            source.width instanceof SVGAnimatedLength ? source.width.baseVal.value : source.width,
            source.height instanceof SVGAnimatedLength ? source.height.baseVal.value : source.height
        )

        this.rect = new Rect(this.rect.x, this.rect.y, this.cropRect.width, this.cropRect.height)
    }

    getImage() {
        return this.image
    }
}