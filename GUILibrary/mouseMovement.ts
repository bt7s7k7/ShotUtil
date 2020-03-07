import { CanvasGUI } from "./GUI.js";

export function registerMouseMovement(target: CanvasGUI, buttonToUse = 1) {
    var old = target.onBackgroundMouse
    target.onBackgroundMouse = (state)=>{
        old.apply(target, [state])

        if (state.down[buttonToUse]) {
            target.offset = target.offset.add(state.delta)
        }
    }
}