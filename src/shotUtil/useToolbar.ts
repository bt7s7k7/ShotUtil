import { mdiArrangeBringForward, mdiArrangeSendBackward, mdiArrowLeft, mdiArrowRight, mdiCheck, mdiClose, mdiContentDuplicate, mdiCrop, mdiDelete, mdiFlipHorizontal, mdiFlipVertical, mdiFormatAnnotationPlus, mdiFormatSize, mdiShapeCirclePlus, mdiShapeSquarePlus, mdiVectorPolylinePlus } from "@mdi/js"
import { shallowReactive, shallowRef } from "vue"
import { assertType, bindObjectFunction } from "../comTypes/util"
import { Color } from "../drawer/Color"
import { Rect } from "../drawer/Rect"
import { KeyCode } from "../drawerInput/DrawerInput"
import { EventListener } from "../eventLib/EventListener"
import { ShapeEditor } from "../shapeLib/ShapeEditor"
import { ArrowShape } from "../shapeLib/shapes/ArrowShape"
import { EllipseShape } from "../shapeLib/shapes/EllipseShape"
import { ImageShape } from "../shapeLib/shapes/ImageShape"
import { SolidColorShape } from "../shapeLib/shapes/SolidColorShape"
import { TextShape } from "../shapeLib/shapes/TextShape"
import { useDynamicsEmitter } from "../vue3gui/DynamicsEmitter"

export type ToolbarItem =
    | { kind: "button", key?: KeyCode | KeyCode[], icon: string, action: () => void }
    | { kind: "toggle", icon: string, value: boolean, action: (v: boolean) => void }
    | { kind: "slider", icon: string, value: number, action: (v: number) => void }
    | { kind: "separator" }
    | { kind: "color-button", value: boolean, color: Color, action: () => void }

export function useToolbar() {
    const emitter = useDynamicsEmitter()
    let lastShortcutListener: EventListener | null = null

    return bindObjectFunction(shallowReactive({
        toolbar: shallowRef([] as ToolbarItem[]),
        updateToolbar(editor: ShapeEditor) {
            this.toolbar.value = []
            const toolbar = this.toolbar.value

            const target = editor.selected
            function addShortcuts() {
                if (lastShortcutListener != null) lastShortcutListener.dispose()
                lastShortcutListener = new EventListener()

                for (const button of toolbar) {
                    if (button.kind == "button" && button.key != null) {
                        for (const key of button.key instanceof Array ? button.key : [button.key]) {
                            editor.drawerInput.keyboard.key(key).onDown.add(lastShortcutListener, () => button.action())
                        }
                    }
                }
            }

            if (target && target.isModal()) {
                toolbar.push({ kind: "button", icon: mdiCheck, key: ["Enter", "KeyC"], action: () => target.modalAccept() })
                toolbar.push({ kind: "button", icon: mdiClose, key: "Escape", action: () => target.modalCancel() })
                addShortcuts()
                return toolbar
            }


            toolbar.push({ kind: "button", icon: mdiShapeSquarePlus, action: () => editor.addShape(new SolidColorShape(new Rect(NaN, NaN, 100, 100))) })
            toolbar.push({ kind: "button", icon: mdiVectorPolylinePlus, action: () => editor.addShape(new ArrowShape()) })
            toolbar.push({ kind: "button", icon: mdiFormatAnnotationPlus, action: () => editor.addShape(new TextShape()) })
            toolbar.push({ kind: "button", icon: mdiShapeCirclePlus, action: () => editor.addShape(new EllipseShape()) })

            if (target) {
                toolbar.push({ kind: "separator" })
                toolbar.push({ kind: "button", icon: mdiDelete, key: ["Delete", "KeyX"], action: () => editor.deleteSelected() })
                toolbar.push({ kind: "button", icon: mdiContentDuplicate, key: "KeyD", action: () => editor.duplicateSelected() })
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

                    toolbar.push({ kind: "button", key: "KeyC", icon: mdiCrop, action: () => target.crop() })
                }

                if (target instanceof ArrowShape) {
                    for (const prop of ["arrowStart", "arrowEnd"] as const) {
                        toolbar.push({ kind: "toggle", value: target[prop], icon: prop == "arrowStart" ? mdiArrowLeft : mdiArrowRight, action: (v) => target[prop] = v })
                    }
                }

                if (target instanceof TextShape) {
                    toolbar.push({
                        kind: "button", key: "KeyC", icon: mdiFormatSize, action: async () => {
                            const newText = await emitter.prompt({ title: "Enter text", initialValue: target.text })
                            if (newText != null) target.text = newText
                        }
                    })
                }
            }

            addShortcuts()
        }
    }))
}
