import { mdiShapeSquarePlus } from "@mdi/js"
import { defineComponent, ref } from "vue"
import { Drawer } from "../drawer/Drawer"
import { Point } from "../drawer/Point"
import { Rect } from "../drawer/Rect"
import { DrawerView } from "../drawerInputVue3/DrawerView"
import { ImageShape } from "../shapeLib/shapes/ImageShape"
import { SolidColorShape } from "../shapeLib/shapes/SolidColorShape"
import { useShapeEditor } from "../shapeLib/useShapeEditor"
import { Button } from "../vue3gui/Button"
import { Icon } from "../vue3gui/Icon"
import { UploadOverlay } from "../vue3gui/UploadOverlay"

export const EditorView = (defineComponent({
    name: "EditorView",
    setup(props, ctx) {
        const pasteInput = ref<HTMLInputElement>()

        const { consumer, editor, grab, handleClick, handleMouseMove, cursor } = useShapeEditor({
            afterRender() {
                pasteInput.value?.focus()
            },
            onReady() {
                editor.value.addShape(new ImageShape(Point.NaN, Drawer.makeTestPattern("uv", new Point(300, 200))))
                // @ts-ignore
                window.editor = editor.value
            }
        })

        function addImages(files: File[]) {
            for (const file of files) {
                const url = URL.createObjectURL(file)
                const image = new Image()
                image.addEventListener("load", () => {
                    const source = new Drawer().matchSize(image).blit(image)
                    editor.value.addShape(new ImageShape(Point.NaN, source))
                })
                image.src = url
            }
        }

        function handlePaste(event: ClipboardEvent) {
            if (event.clipboardData == null) return
            const files = [...event.clipboardData.files]
            addImages(files)
        }

        function addSolidBox() {
            editor.value.addShape(new SolidColorShape(new Rect(NaN, NaN, 100, 100)))
        }

        return () => (
            <UploadOverlay onDrop={addImages} class="flex-fill">
                <input ref={pasteInput} onPaste={handlePaste} />
                <DrawerView class="absolute-fill" consumer={consumer} />
                <div
                    class="absolute-fill" onMousedown={grab} onTouchstart={grab}
                    onMousemove={handleMouseMove} onClick={handleClick}
                    style={{ cursor: cursor.value }}
                />
                <div class="absolute top-0 left-0 right-0 bg-white">
                    <Button onClick={addSolidBox} clear> <Icon icon={mdiShapeSquarePlus} /> </Button>
                </div>
            </UploadOverlay>
        )
    }
}))
