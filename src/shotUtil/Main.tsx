import { mdiShapeSquarePlus, mdiVectorPolylinePlus } from "@mdi/js"
import { defineComponent } from "vue"
import { Point } from "../drawer/Point"
import { Button, ButtonGroup } from "../vue3gui/Button"
import { MountNode } from "../vue3gui/MountNode"
import { useResizeWatcher } from "../vue3gui/util"
import { Board } from "./board/Board"
import { LineObject } from "./objects/LineObject"
import { RectObject } from "./objects/RectObject"

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
            rect.flushChanges()
            board.addObject(rect)
        } 

        function addLine() {
            const line = new LineObject()
            line.points.push(
                new Point(-100, -100),
                new Point(100, 100),
            )
            line.flushChanges()
            board.addObject(line)
        }

        return () => (
            <div class="flex-fill flex column">
                <div class="bg-secondary-translucent">
                    <ButtonGroup clear>
                        <Button icon={mdiShapeSquarePlus} v-label:bottom-right="Add Rectangle" onClick={addRect} />
                        <Button icon={mdiVectorPolylinePlus} v-label="Add Line" onClick={addLine} />
                    </ButtonGroup>
                </div>
                <div class="flex-fill">
                    <MountNode node={board.boardHost} />
                </div>
            </div>
        )
    },
}))
