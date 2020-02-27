import { CanvasGUI, GUIControl, Rect } from "./GUILibrary/GUI.js"
import { Button } from "./GUILibrary/Button.js"
import { Draggable } from "./GUILibrary/Draggable.js"
import { DraggableButton } from "./GUILibrary/DraggableButton.js"
import { UserResizable } from "./GUILibrary/UserResizable.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement

var gui = new CanvasGUI(canvas)
window["gui"] = gui
gui.centerCoords = true

{
    let control = new UserResizable()
    gui.addControl(control)
    control.rect = new Rect(-100, -100, 200, 200)
    control.preserveAspectRatio = true
}

function update() {
    gui.update()

    requestAnimationFrame(update)
}

update()