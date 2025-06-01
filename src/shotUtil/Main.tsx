import { mdiArrowLeft, mdiArrowRight, mdiFormatColorFill, mdiFormatLineWeight, mdiShapeSquarePlus, mdiVectorPolylinePlus } from "@mdi/js"
import { defineComponent } from "vue"
import { Point } from "../drawer/Point"
import { Button, ButtonGroup } from "../vue3gui/Button"
import { Icon } from "../vue3gui/Icon"
import { MountNode } from "../vue3gui/MountNode"
import { Slider } from "../vue3gui/Slider"
import { ToggleButton } from "../vue3gui/ToggleButton"
import { useEventListener, useResizeWatcher } from "../vue3gui/util"
import { Board } from "./board/Board"
import { LineObject } from "./objects/LineObject"
import { RectObject } from "./objects/RectObject"
import { EndArrowProperty, StartArrowProperty } from "./properties/ArrowProperty"
import { ColorProperty, COLORS } from "./properties/ColorProperty"
import { FillProperty } from "./properties/FillProperty"
import { LINE_WIDTHS, LineWidthProperty } from "./properties/LineWidthProperty"

export const Main = (defineComponent({
    name: "Main",
    setup(props, ctx) {
        const board =new Board()
        board.boardHost.classList.add("absolute-fill")

        useResizeWatcher((size) => {
            const x = (size.width * 0.5 | 0)
            const y = (size.height * 0.5 | 0)

            for (const group of [board.renderHost, board.selectionHost, board.controlHost]) {
                group.setAttribute("transform", `translate(${x}, ${y})`)
            }
        }, { immediate: true })

        function addRect() {
            const rect = new RectObject()
            rect.size = new Point(100,100)
            board.addObjectWithUndo(rect)
        } 

        function addLine() {
            const line = new LineObject()
            line.points.push(
                new Point(-100, -100).floor().add(0.5, 0.5),
                new Point(100, 100).floor().add(0.5, 0.5),
            )
            board.addObjectWithUndo(line)
        }

        useEventListener(window, "contextmenu", (event)=>{
            if (board.dragActivity) {
                event.preventDefault()
                board.dragActivity.interrupt()
                return
            }
        })

        useEventListener(window, "keypress", (event) => {
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
        })

        return () => (
            <div class="flex-fill flex column">
                <div class="bg-secondary-translucent flex row center-cross">
                    <ButtonGroup clear>
                        <Button icon={mdiShapeSquarePlus} v-label:bottom-right="Add Rectangle" onClick={addRect} />
                        <Button icon={mdiVectorPolylinePlus} v-label="Add Line" onClick={addLine} />
                        {board.selected && <>
                            <div class="border-left"></div>
                            {ColorProperty.has(board.selected) && <div class="flex row center gap-2">
                                {COLORS.map(color => (
                                    <Button plain class="border border-white w-3 h-3" style={{backgroundColor: color.toHex()}} onClick={() => ColorProperty.get(board.selected).value = color} />
                                ))}
                            </div>}
                            {LineWidthProperty.has(board.selected) && <>
                                <Icon icon={mdiFormatLineWeight} class="mx-2" />
                                <Slider class="w-200" min={0} max={LINE_WIDTHS.length - 1} step={1} stepped vModel={LineWidthProperty.get(board.selected).index} />
                            </>}
                            <div class="mx-2 flex row">
                                {EndArrowProperty.has(board.selected) && <ButtonGroup override>
                                    <ToggleButton
                                        clear icon={mdiArrowLeft} v-label="Start arrow"
                                        vModel={EndArrowProperty.get(board.selected).value}
                                        enabledStyle={{ clear: false, variant: "success", class:"" }}
                                    />
                                </ButtonGroup>}
                                {StartArrowProperty.has(board.selected) && <ButtonGroup override>
                                    <ToggleButton
                                        clear icon={mdiArrowRight} v-label="End arrow"
                                        vModel={StartArrowProperty.get(board.selected).value}
                                        enabledStyle={{ clear: false, variant: "success", class:"" }}
                                    />
                                </ButtonGroup>}
                            </div>
                            {FillProperty.has(board.selected) && <ButtonGroup override>
                                <ToggleButton
                                    clear icon={mdiFormatColorFill} v-label="Start arrow"
                                    vModel={FillProperty.get(board.selected).value}
                                    enabledStyle={{ clear: false, variant: "success", class:"" }}
                                />
                            </ButtonGroup>}
                        </>}
                    </ButtonGroup>
                </div>
                <div class="flex-fill">
                    <MountNode node={board.boardHost} />
                </div>
            </div>
        )
    },
}))
