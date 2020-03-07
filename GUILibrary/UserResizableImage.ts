import { UserResizable } from "./UserResizable.js";
import { Point, Rect } from "./GUI.js";

export class UserResizableImage extends UserResizable {
    protected image: CanvasImageSource
    public cropRect: Rect

    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        var screenRect = this.getScreenRect(offset)
        screenRect.x = Math.floor(screenRect.x)
        screenRect.y = Math.floor(screenRect.y)
        ctx.drawImage(this.image, this.cropRect.x, this.cropRect.y, this.cropRect.width, this.cropRect.height, screenRect.x, screenRect.y, screenRect.width, screenRect.height)
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