import { mdiArrangeBringForward, mdiArrangeSendBackward, mdiContentDuplicate, mdiDelete, mdiFlipHorizontal, mdiFlipVertical, mdiShapeSquarePlus } from "@mdi/js"
import { shallowReactive, shallowRef } from "vue"
import { assertType, bindObjectFunction } from "../comTypes/util"
import { Color } from "../drawer/Color"
import { Point } from "../drawer/Point"
import { Rect } from "../drawer/Rect"
import { ShapeEditor } from "../shapeLib/ShapeEditor"
import { ImageShape } from "../shapeLib/shapes/ImageShape"
import { SolidColorShape } from "../shapeLib/shapes/SolidColorShape"

export type ToolbarItem =
    | { kind: "button", icon: string, action: () => void }
    | { kind: "toggle", icon: string, value: boolean, action: (v: boolean) => void }
    | { kind: "slider", icon: string, value: number, action: (v: number) => void }
    | { kind: "separator" }
    | { kind: "color-button", value: boolean, color: Color, action: () => void }

export function useToolbar() {
    return bindObjectFunction(shallowReactive({
        toolbar: shallowRef([] as ToolbarItem[]),
        updateToolbar(editor: ShapeEditor) {
            this.toolbar.value = []
            const toolbar = this.toolbar.value

            toolbar.push({ kind: "button", icon: mdiShapeSquarePlus, action: () => editor.addShape(new SolidColorShape(new Rect(NaN, NaN, 100, 100))) })

            const target = editor.selected
            if (target) {
                toolbar.push({ kind: "separator" })
                toolbar.push({ kind: "button", icon: mdiDelete, action: () => editor.deleteSelected() })
                toolbar.push({ kind: "button", icon: mdiContentDuplicate, action: () => editor.duplicateShape(target).translate(Point.one.mul(20)) })
                toolbar.push({ kind: "button", icon: mdiArrangeBringForward, action: () => editor.moveToTop(target) })
                toolbar.push({ kind: "button", icon: mdiArrangeSendBackward, action: () => editor.moveToBack(target) })

                toolbar.push({ kind: "separator" })

                if (assertType<{ color: Color }>(target) && target.color instanceof Color) {
                    for (const color of [Color.black, Color.white, Color.red, Color.green, Color.blue, Color.cyan, Color.magenta, Color.yellow]) {
                        toolbar.push({ kind: "color-button", color, value: target.color == color, action: () => target.color = color })
                    }
                }

                if (target instanceof ImageShape) {
                    for (const axis of ["x", "y"] as const) {
                        toolbar.push({ kind: "button", icon: axis == "x" ? mdiFlipHorizontal : mdiFlipVertical, action: () => target.flip(axis) })
                    }
                }
            }
        }
    }))
}
