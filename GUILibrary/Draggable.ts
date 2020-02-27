import { IControlMouseState, GUIControl } from "./GUI.js";

export class Draggable extends GUIControl {
    public buttonToListenTo = 0
    setMouseState(state: IControlMouseState) {
        super.setMouseState(state)
        if (state.down[this.buttonToListenTo]) this.rect = this.rect.translate(state.delta)
        return true
    }
}