import { mdiArrangeBringToFront, mdiArrangeSendToBack, mdiArrowLeft, mdiArrowRight, mdiFileExportOutline, mdiFlipHorizontal, mdiFlipVertical, mdiFormatAlignCenter, mdiFormatAlignLeft, mdiFormatAlignRight, mdiFormatColorFill, mdiFormatLineWeight, mdiFormatSize, mdiFormatVerticalAlignBottom, mdiFormatVerticalAlignCenter, mdiFormatVerticalAlignTop, mdiShapeCirclePlus, mdiShapeSquarePlus, mdiVectorPolylinePlus } from "@mdi/js"
import { computed, defineComponent, PropType, Ref, ref, render, shallowRef, watch } from "vue"
import { Point } from "../drawer/Point"
import { Button, ButtonGroup } from "../vue3gui/Button"
import { useDynamicsEmitter } from "../vue3gui/DynamicsEmitter"
import { Icon } from "../vue3gui/Icon"
import { MountNode } from "../vue3gui/MountNode"
import { Slider } from "../vue3gui/Slider"
import { TextField } from "../vue3gui/TextField"
import { ToggleButton } from "../vue3gui/ToggleButton"
import { UploadOverlay } from "../vue3gui/UploadOverlay"
import { useGrab } from "../vue3gui/useGrab"
import { useEventListener, useResizeWatcher } from "../vue3gui/util"
import { Board } from "./board/Board"
import { EllipseObject } from "./objects/EllipseObject"
import { ImageObject } from "./objects/ImageObject"
import { LineObject } from "./objects/LineObject"
import { RectObject } from "./objects/RectObject"
import { ShapeObject } from "./objects/ShapeObject"
import { TextObject } from "./objects/TextObject"
import { EndArrowProperty, StartArrowProperty } from "./properties/ArrowProperty"
import { ColorProperty, COLORS } from "./properties/ColorProperty"
import { FillProperty } from "./properties/FillProperty"
import { FlipXProperty, FlipYProperty } from "./properties/FlipProperty"
import { LINE_WIDTHS, LineWidthProperty } from "./properties/LineWidthProperty"
import { Property } from "./properties/Property"
import { HorizontalAlignProperty, TextProperty, VerticalAlignProperty } from "./properties/TextProperty"

const _ShapeAdder = defineComponent({
    name: "_ShapeAdder",
    props: {
        label: { type: String, required: true },
        icon: { type: String, required: true },
        nudge: { type: Boolean },
    },
    emits: {
        create: (position: Point) => true,
    },
    setup(props, ctx) {
        const add = useGrab({
            onMoveStart(event) {
                const decoratorObject = document.createElement("div")
                render(<Icon icon={props.icon} />, decoratorObject)
                decoratorObject.setAttribute("class", "absolute")
                decoratorObject.style.left = event.currentX + "px"
                decoratorObject.style.top = event.currentY + "px"
                document.body.appendChild(decoratorObject)
                return decoratorObject
            },
            onMove(event, decoratorObject) {
                decoratorObject.style.left = event.currentX + "px"
                decoratorObject.style.top = event.currentY + "px"
            },
            onMoveEnd(event, decoratorObject) {
                decoratorObject.remove()
                ctx.emit("create", new Point(event.currentX, event.currentY).floor())
            },
        })

        return () => (
            props.nudge ? (
                <Button icon={props.icon} v-label:bottom-right={props.label} onMouseDown={add} />
            ) : (
                <Button icon={props.icon} v-label={props.label} onMouseDown={add} />
            )
        )
    },
})

const _BooleanProperty = defineComponent({
    name: "_BooleanProperty",
    props: {
        board: { type: Board, required:true },
        property: { type: Function, required: true },
        icon: { type: String, required: true },
        label: { type: String, required: true },
    },
    setup(props, ctx) {
        return () => <>
            {(props.property as typeof Property).has(props.board.selected) && <ButtonGroup override>
                <ToggleButton
                    clear icon={props.icon} v-label={props.label}
                    vModel={(props.property as typeof Property).get(props.board.selected).value as boolean}
                    enabledStyle={{ clear: false, variant: "success", class: "" }}
                />
            </ButtonGroup>}
        </>
    },
})

const _EnumProperty = defineComponent({
    name: "_EnumProperty",
    props: {
        board: { type: Board, required: true },
        property: { type: Function, required: true },
        options: { type: Array as PropType<{ key: any, icon: string, label: string }[]>, required: true },
    },
    setup(props, ctx) {
        const value = ref(null) as Ref<any>

        const property = props.property as typeof Property

        watch(() => props.board.selected, selected => {
            if (!selected || !property.has(selected)) return
            value.value = property.get(selected).value
        }, {immediate: true})

        watch(value, newValue => {
            property.get(props.board.selected).value = newValue
        })

        return () => <div class="mx-1 flex row border rounded">
            {props.options.map(({ icon, label, key }) => (
                <ButtonGroup override>
                    <ToggleButton
                        clear icon={icon} v-label={label}
                        modelValue={value.value == key} onChange={(v) => v && (value.value = key)}
                        enabledStyle={{ clear: false, variant: "success", class: "" }}
                    />
                </ButtonGroup>
            ))}
        </div>
    },
})

export const Main = (defineComponent({
    name: "Main",
    setup(props, ctx) {
        const emitter = useDynamicsEmitter()

        const board = new Board()
        board.boardHost.classList.add("absolute-fill")

        const offset = shallowRef(Point.zero)
        const zoom = shallowRef(1)
        const absoluteZoom = computed(() => {
            return Math.exp(zoom.value) / Math.exp(1)
        })
        const screenSize = useResizeWatcher()
        const absoluteOffset = computed(() => {
            return new Point(
                (screenSize.width * 0.5 | 0) + offset.value.x,
                (screenSize.height * 0.5 | 0) + offset.value.y,
            )
        })

        watch(() => [absoluteOffset.value, absoluteZoom.value] as const, ([{ x, y }, zoom]) => {
            board.eventScale = 1 / zoom

            for (const group of [board.renderHost, board.selectionHost, board.controlHost, board.boundsObject]) {
                group.setAttribute("transform", `translate(${x}, ${y}) scale(${zoom})`)
            }
        }, { immediate: true })

        function screenToWorld(position: Point) {
            if (position.y <= 23) {
                position = offset.value.mul(-1 / absoluteZoom.value)
                return board.snapPoint(position)
            }
            return board.snapPoint(position.sub(absoluteOffset.value).mul(1/absoluteZoom.value).add(0, -23))
        }

        function worldToScreen(position: Point) {
            return position.mul(absoluteZoom.value).add(absoluteOffset.value).add(0, 23)
        }

        function addRect(position: Point) {
            position = screenToWorld(position)
            const rect = new RectObject()
            rect.position = position
            rect.size = new Point(90, 90)
            board.addObjectWithUndo(rect)
            board.select(rect)
        }

        function addEllipse(position: Point) {
            position = screenToWorld(position)
            const ellipse = new EllipseObject()
            ellipse.position = position
            ellipse.size = new Point(90, 90)
            board.addObjectWithUndo(ellipse)
            board.select(ellipse)
        }

        function addText(position: Point) {
            position = screenToWorld(position)
            const text = new TextObject()
            text.position = position
            text.size = new Point(90, 90)
            board.addObjectWithUndo(text)
            board.select(text)
        }

        function addLine(position: Point) {
            position = screenToWorld(position)
            const line = new LineObject()
            line.points.push(
                new Point(-50, -50).floor().add(0.5, 0.5).add(position),
                new Point(50, 50).floor().add(0.5, 0.5).add(position),
            )
            board.addObjectWithUndo(line)
            board.select(line)
        }

        useEventListener(window, "contextmenu", (event) => {
            if (board.dragActivity) {
                event.preventDefault()
                board.dragActivity.interrupt()
                return
            }
        })

        function editText() {
            const property = TextProperty.get(board.selected)
            const value = ref(property.value)
            const {position, size} = (board.selected as ShapeObject)
            const screenPosition = worldToScreen(position.add(size.mul(-0.5)))
            suspendFocusChange.value++

            emitter.popup(screenPosition, <>
                <TextField vModel={value.value} class="w-fill" placeholder="Enter text..." focus />
            </>,{
                align: "right-down",
                props: {
                    backdropCancels: true,
                    contentClass: "p-0",
                    class: "p-0",
                    style: { width: size.x + "px" },
                },
            }).then((ok) => {
                if (!ok) return
                property.value = value.value
            }).finally(() => {
                suspendFocusChange.value--
            })
        }

        function handleKeypress(event: KeyboardEvent) {
            if (suspendFocusChange.value > 0) return

            if (event.code == "Enter") {
                const selected = board.selected
                if (selected && TextProperty.has(selected)) {
                    setTimeout(() => {
                        editText()
                    }, 10)
                }
                return
            }

            if (event.code == "KeyY" && event.ctrlKey) {
                event.preventDefault()
                board.undo()
                return
            }

            if (event.code == "KeyD" && event.ctrlKey) {
                event.preventDefault()
                if (board.selected) {
                    const clone =  board.selected.duplicate()

                    if (clone instanceof ShapeObject) {
                        clone.position = clone.position.add(20, 20)
                    } else if (clone instanceof LineObject) {
                        clone.translate(new Point(20, 20))
                    }
                    
                    board.addObjectWithUndo(clone)
                    board.select(clone)
                }
                return
            }

            if (event.code == "Delete") {
                if (board.dragActivity) {
                    board.dragActivity.delete()
                    return
                }

                if (board.selected != null) {
                    board.removeObjectWithUndo(board.selected)
                }
            }
        }

        const dragViewport = useGrab({
            button: 1,
            onMoveStart(event) {
                event.nativeEvent.preventDefault()
                event.nativeEvent.stopPropagation()
                return offset.value
            },
            onMove(event, state) {
                offset.value = state.add(event.deltaX, event.deltaY).floor()
            },
        })
        function scrollViewport(event: WheelEvent) {
             if (event.ctrlKey) {
                event.preventDefault()
                zoom.value += (event.deltaY * 0.05 | 0) * -0.1
                return
            }

            let delta = new Point(event.deltaX, event.deltaY)
            if (event.shiftKey) delta = new Point(0, event.deltaY)
            offset.value = offset.value.add(delta.mul(-1)).floor()
        }

        const stopPropagation = function(event: Event) { event.stopPropagation() }

        function addImages(files: File[]) {
            for (const file of files) {
                (async () => {
                    const url = await new Promise<string>((resolve) => {
                        const reader = new FileReader()
                        reader.addEventListener("load", () => {
                            const url = reader.result
                            resolve(url as string)
                        })
                        reader.readAsDataURL(file)
                    })
                    
                    const size = await new Promise<Point>(resolve => {
                        const image = new Image()
                        image.addEventListener("load", () => {
                            resolve(new Point(image.width, image.height))
                        })
                        image.src = url
                    })

                    const image = new ImageObject()
                    image.src = url
                    image.nativeSize = size
                    image.size = board.snapPoint(size)
                    image.position = board.snapPoint(offset.value.mul(-1))

                    board.addObjectWithUndo(image)
                })()
            }
        }

        const pasteInput = ref<HTMLInputElement>()
        const suspendFocusChange = ref(0)
        function focusPasteInput() {
            if (suspendFocusChange.value > 0) return
            pasteInput.value?.focus()
        }
        function handlePaste(event: ClipboardEvent) {
            if (event.clipboardData == null) return
            const files = [...event.clipboardData.files]
            addImages(files)
        }

        function moveToBack() {
            board.selected?.moveToBack()
        }
        
        function moveToFront() {
            board.selected?.moveToFront()
        }

        function exportSVG() {
            const svg = board.export()
            const data =new Blob([new TextEncoder().encode(svg)], {type: "image/svg+xml" })
            const url = URL.createObjectURL(data)
            window.open(url, "_blank")
            setTimeout(() => {
                URL.revokeObjectURL(url)
            }, 100)
            //const url = `data:image/svg+xml,${encodeURIComponent(svg)}`
        }

        return () => (
            <UploadOverlay class="flex-fill flex column" onDrop={addImages}
            // @ts-ignore
            onMousemove={focusPasteInput} onWheel={scrollViewport}
            >
                <div class="bg-secondary-translucent flex row center-cross">
                    <ButtonGroup clear>
                        <_ShapeAdder icon={mdiShapeSquarePlus} label="Add Rectangle" nudge onCreate={addRect} />
                        <_ShapeAdder icon={mdiShapeCirclePlus} label="Add Circle" onCreate={addEllipse} />
                        <_ShapeAdder icon={mdiVectorPolylinePlus} label="Add Line" onCreate={addLine} />
                        <_ShapeAdder icon={mdiFormatSize} label="Add Text" onCreate={addText} />
                        {board.selected && <>
                            <div class="border-left border-secondary mx-2 h-4"></div>

                            <Button icon={mdiArrangeBringToFront} v-label="Bring to front" onClick={moveToFront} />
                            <Button icon={mdiArrangeSendToBack} v-label="Send to back" onClick={moveToBack} />

                            {ColorProperty.has(board.selected) && <div class="flex row center gap-2 mx-2">
                                {COLORS.map(color => (
                                    <Button plain class="border border-white w-3 h-3" style={{ backgroundColor: color.toHex() }} onClick={() => ColorProperty.get(board.selected).value = color} />
                                ))}
                            </div>}

                            {LineWidthProperty.has(board.selected) && <>
                                <Icon icon={mdiFormatLineWeight} class="mx-2" />
                                <Slider class="w-200" min={0} max={LINE_WIDTHS.length - 1} step={1} stepped vModel={LineWidthProperty.get(board.selected).index} />
                            </>}

                            <_BooleanProperty board={board} icon={mdiArrowLeft} label="Show arrow at start" property={StartArrowProperty} />
                            <_BooleanProperty board={board} icon={mdiArrowRight} label="Show arrow at end" property={EndArrowProperty} />
                            <_BooleanProperty board={board} icon={mdiFormatColorFill} label="Fill" property={FillProperty} />
                            <_BooleanProperty board={board} icon={mdiFlipHorizontal} label="Flip horizontal" property={FlipXProperty} />
                            <_BooleanProperty board={board} icon={mdiFlipVertical} label="Flip vertical" property={FlipYProperty} />

                            {HorizontalAlignProperty.has(board.selected) && (
                                <_EnumProperty board={board} options={[
                                    { key: "start", icon: mdiFormatAlignLeft, label: "Align left" },
                                    { key: "middle", icon: mdiFormatAlignCenter, label: "Align middle" },
                                    { key: "end", icon: mdiFormatAlignRight, label: "Align right" },
                                ]} property={HorizontalAlignProperty} />
                            )}

                            {VerticalAlignProperty.has(board.selected) && (
                                <_EnumProperty board={board} options={[
                                    { key: "auto", icon: mdiFormatVerticalAlignBottom, label: "Align bottom" },
                                    { key: "middle", icon: mdiFormatVerticalAlignCenter, label: "Align center" },
                                    { key: "hanging", icon: mdiFormatVerticalAlignTop, label: "Align top" },
                                ]} property={VerticalAlignProperty} />
                            )}
                        </>}
                        <div class="flex-fill"></div>
                        <Button icon={mdiFileExportOutline} v-label:bottom-left="Export SVG" onClick={exportSVG} />
                    </ButtonGroup>
                </div>
                <div class="flex-fill" onMousedown={dragViewport} onPointerdown={stopPropagation}>
                    <input ref={pasteInput} onPaste={handlePaste} class="opacity-0" onKeydown={handleKeypress} />
                    <MountNode node={board.boardHost} />
                </div>
            </UploadOverlay>
        )
    },
}))
