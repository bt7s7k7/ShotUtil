import { defineComponent, ref } from "vue"
import { Drawer } from "../drawer/Drawer"
import { Point } from "../drawer/Point"
import { DrawerView } from "../drawerInputVue3/DrawerView"
import { ImageShape } from "../shapeLib/shapes/ImageShape"
import { useShapeEditor } from "../shapeLib/useShapeEditor"

export const EditorView = (defineComponent({
    name: "EditorView",
    setup(props, ctx) {
        const pasteInput = ref<HTMLInputElement>()

        const { consumer, editor, grab, handleClick, handleMouseMove } = useShapeEditor({
            afterRender() {
                pasteInput.value?.focus()
            },
            onReady() {
                editor.value.addShape(new ImageShape(Point.zero, Drawer.makeTestPattern("uv", new Point(300, 200))))
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

                })
                image.src = url
            }
        }

        function handlePaste(event: ClipboardEvent) {

        }

        return () => (
            <div class="flex-fill">
                <input ref={pasteInput} class="invisible ignored" onPaste={handlePaste} />
                <DrawerView class="absolute-fill" consumer={consumer} />
                <div
                    class="absolute-fill" onMousedown={grab} onTouchstart={grab}
                    onMousemove={handleMouseMove} onClick={handleClick}
                />
            </div>
        )
    }
}))
