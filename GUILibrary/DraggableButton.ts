import { Button } from "./Button.js";
import { IControlMouseState } from "./GUI.js";
import { Draggable } from "./Draggable.js";

export class DraggableButton extends Button {
    setMouseState(state: IControlMouseState) {
        super.setMouseState(state)
        Draggable.prototype.setMouseState.apply(this, [state])
        return true
    }
}