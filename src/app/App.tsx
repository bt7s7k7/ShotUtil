import { defineComponent } from "vue"
import { EditorView } from "../shotUtil/EditorView"
import { DynamicsEmitter } from "../vue3gui/DynamicsEmitter"

export const App = defineComponent({
    name: "App",
    setup(props, ctx) {
        return () => (
            <DynamicsEmitter>
                <EditorView />
            </DynamicsEmitter>
        )
    }
})
