import { GUIControl, Point } from "./GUI.js";


export class ImageControl extends GUIControl {
    public image: CanvasImageSource;
    public opacity = 1;
    draw(offset: Point, ctx: CanvasRenderingContext2D) {
        if (this.image) {
            var screenRect = this.getScreenRect(offset)
            screenRect.x = Math.floor(screenRect.x)
            screenRect.y = Math.floor(screenRect.y)
            var oldAlpha = ctx.globalAlpha
            ctx.globalAlpha = this.opacity * oldAlpha
            ctx.drawImage(this.image, ...screenRect.spread())
            ctx.globalAlpha = oldAlpha
        }
    }
}