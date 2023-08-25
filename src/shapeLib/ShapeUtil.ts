import { Color } from "../drawer/Color"
import { Drawer } from "../drawer/Drawer"
import { Point } from "../drawer/Point"

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
}
