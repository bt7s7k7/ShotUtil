import { mdiMagnify } from "@mdi/js"
import { defineComponent, getCurrentInstance, ref } from "vue"
import { multicast, unreachable } from "../comTypes/util"
import { Drawer } from "../drawer/Drawer"
import { DrawerView } from "../drawerInputVue3/DrawerView"
import { ImageShape } from "../shapeLib/shapes/ImageShape"
import { useShapeEditor } from "../shapeLib/useShapeEditor"
import { Button } from "../vue3gui/Button"
import { Icon } from "../vue3gui/Icon"
import { Slider } from "../vue3gui/Slider"
import { UploadOverlay } from "../vue3gui/UploadOverlay"
import { useToolbar } from "./useToolbar"

export const EditorView = (defineComponent({
    name: "EditorView",
    setup(props, ctx) {
        const pasteInput = ref<HTMLInputElement>()

        const zoom = ref("1")
        const instance = getCurrentInstance()!
        const { consumer, editor, grab, handleClick, handleMouseMove, cursor, pan, handleWheel, renderOutput } = useShapeEditor({
            afterRender() {
                const modalActive = (instance.root as any)["__v3g_modalStack"]?.stack.length > 0
                if (!modalActive) pasteInput.value?.focus()
            },
            onReady() {
                // @ts-ignore
                window.editor = editor.value

                updateToolbar(editor.value)
                editor.value.onSelectionChange.add(editor.value, () => updateToolbar(editor.value))
                editor.value.onZoomLevelChange.add(editor.value, (newZoom) => zoom.value = newZoom < 1 ? `1/${1 / newZoom}` : newZoom.toString())
            }
        })

        function addImages(files: File[]) {
            for (const file of files) {
                const url = URL.createObjectURL(file)
                const image = new Image()
                image.addEventListener("load", () => {
                    const source = new Drawer().matchSize(image).blit(image)
                    editor.value.addShape(new ImageShape(source))
                })
                image.src = url
            }
        }

        function handlePaste(event: ClipboardEvent) {
            if (event.clipboardData == null) return
            const files = [...event.clipboardData.files]
            addImages(files)
        }

        const { toolbar, updateToolbar } = useToolbar()

        const outputImage = ref<HTMLInputElement>(null!)
        function handleOutputImage() {
            outputImage.value.src = renderOutput()
        }

        return () => (
            <UploadOverlay onDrop={addImages} class="flex-fill">
                <input ref={pasteInput} onPaste={handlePaste} class="opacity-0" data-drawer-input-ignore />
                <DrawerView class="absolute-fill" consumer={consumer} />
                <img
                    class="absolute-fill opacity-0" onMousedown={multicast(pan, grab)} onTouchstart={grab} ref={outputImage}
                    onMousemove={handleMouseMove} onClick={handleClick} onWheel={handleWheel} onContextmenu={handleOutputImage}
                    style={{ cursor: cursor.value }}
                />
                <div class="absolute top-0 left-0 right-0 bg-dark">
                    <div class="bg-secondary-translucent flex row center-cross">
                        {toolbar.value.map(item => (
                            item.kind == "button" ? (
                                <Button clear onClick={item.action}> <Icon icon={item.icon} /> </Button>
                            ) : item.kind == "toggle" ? (
                                <Button clear onClick={() => { item.action(!item.value); updateToolbar(editor.value) }} class={[item.value && "text-success"]}> <Icon icon={item.icon} /> </Button>
                            ) : item.kind == "slider" ? <>
                                <Icon icon={item.icon} />
                                <Slider modelValue={item.value} onInput={(v) => { item.action(v as number); updateToolbar(editor.value) }} />
                            </> : item.kind == "separator" ? (
                                <div class="border-left h-fill" />
                            ) : item.kind == "color-button" ? (
                                <button
                                    class="w-3 mx-1 h-3 border-none"
                                    style={{ outline: item.value ? "2px solid var(--bg-primary)" : item.color.toGreyscale() == 0 ? "1px solid white" : "none", backgroundColor: item.color.toHex() }}
                                    onClick={() => { item.action(); updateToolbar(editor.value) }}
                                />
                            ) : unreachable()
                        ))}

                        <div class="flex-fill" />

                        <Icon icon={mdiMagnify} />
                        ×
                        <div class="mr-2 w-5 small">{zoom.value}</div>
                    </div>
                </div>
            </UploadOverlay>
        )
    }
}))
