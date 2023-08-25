import { shallowRef } from "vue"
import { Point } from "../drawer/Point"
import { defineDrawerInputConsumer } from "../drawerInput/DrawerInputConsumer"
import { useGrab } from "../vue3gui/useGrab"
import { ShapeEditor, ShapeEditorDragState } from "./ShapeEditor"

const NULL_CALLBACK = null as ((editor: ShapeEditor) => void) | null

export function useShapeEditor({ afterRender = NULL_CALLBACK, onReady = NULL_CALLBACK } = {}) {
    const editor = shallowRef<ShapeEditor>(null!)
    const cursor = shallowRef("initial")
    const consumer = defineDrawerInputConsumer((self, drawerInput) => {
        editor.value = new ShapeEditor(drawerInput)
        editor.value.onPostRender.add(editor.value, () => afterRender?.(editor.value))
        editor.value.onCursorChange.add(editor.value, (newCursor) => cursor.value = newCursor)
        onReady?.(editor.value)
        return editor.value
    })

    const grab = useGrab<ShapeEditorDragState>({
        onMoveStart(event, reject) {
            const pos = new Point(event.currentX, event.currentY)
            const state = editor.value.handleDrag(pos)
            if (state == null) {
                reject()
                return null!
            }

            return state
        },
        onMove(event, state) {
            const pos = new Point(event.currentX, event.currentY)
            state.update(pos)
        },
        onMoveEnd(event, state) {
            state.end()
        }
    })

    const pan = useGrab({
        button: 1,
        onMove(event) {
            editor.value.handlePan(new Point(event.moveX, event.moveY))
        }
    })

    function handleMouseMove(event: MouseEvent) {
        editor.value.handleMouseMove(new Point(event.clientX, event.clientY))
    }

    function handleClick(event: MouseEvent) {
        editor.value.handleClick(new Point(event.clientX, event.clientY))
    }

    function handleWheel(event: WheelEvent) {
        event.preventDefault()
        editor.value.drawerInput.processWheelEvent(event)
    }

    return {
        consumer, grab, editor, handleMouseMove, handleClick, handleWheel, cursor, pan
    }
}
