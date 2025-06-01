import { mdiArrangeBringToFront, mdiArrangeSendToBack, mdiArrowLeft, mdiArrowRight, mdiFormatColorFill, mdiFormatLineWeight, mdiShapeSquarePlus, mdiVectorPolylinePlus } from "@mdi/js"
import { computed, defineComponent, ref, render, shallowRef, watch } from "vue"
import { Point } from "../drawer/Point"
import { Button, ButtonGroup } from "../vue3gui/Button"
import { Icon } from "../vue3gui/Icon"
import { MountNode } from "../vue3gui/MountNode"
import { Slider } from "../vue3gui/Slider"
import { ToggleButton } from "../vue3gui/ToggleButton"
import { UploadOverlay } from "../vue3gui/UploadOverlay"
import { useGrab } from "../vue3gui/useGrab"
import { useEventListener, useResizeWatcher } from "../vue3gui/util"
import { Board } from "./board/Board"
import { ImageObject } from "./objects/ImageObject"
import { LineObject } from "./objects/LineObject"
import { RectObject } from "./objects/RectObject"
import { EndArrowProperty, StartArrowProperty } from "./properties/ArrowProperty"
import { ColorProperty, COLORS } from "./properties/ColorProperty"
import { FillProperty } from "./properties/FillProperty"
import { LINE_WIDTHS, LineWidthProperty } from "./properties/LineWidthProperty"
import { Property } from "./properties/Property"

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

export const Main = (defineComponent({
    name: "Main",
    setup(props, ctx) {
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

            for (const group of [board.renderHost, board.selectionHost, board.controlHost]) {
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

        function addRect(position: Point) {
            position = screenToWorld(position)
            const rect = new RectObject()
            rect.position = position
            rect.size = new Point(90, 90)
            board.addObjectWithUndo(rect)
            board.select(rect)
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

        function handleKeypress(event: KeyboardEvent) {
            if (event.code == "KeyY" && event.ctrlKey) {
                event.preventDefault()
                board.undo()
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
        function focusPasteInput() {
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

        return () => (
            <UploadOverlay class="flex-fill flex column" onDrop={addImages}
            // @ts-ignore
            onMousemove={focusPasteInput} onWheel={scrollViewport}
            >
                <div class="bg-secondary-translucent flex row center-cross">
                    <ButtonGroup clear>
                        <_ShapeAdder icon={mdiShapeSquarePlus} label="Add Rectangle" nudge onCreate={addRect} />
                        <_ShapeAdder icon={mdiVectorPolylinePlus} label="Add Line" onCreate={addLine} />
                        {board.selected && <>
                            <Button icon={mdiArrangeBringToFront} v-label="Bring to front" onClick={moveToFront} />
                            <Button icon={mdiArrangeSendToBack} v-label="Send to back" onClick={moveToBack} />

                            <div class="border-left border-secondary mx-2 h-4"></div>

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
                        </>}
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
