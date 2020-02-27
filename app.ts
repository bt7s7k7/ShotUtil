import { CanvasGUI, GUIControl, Rect } from "./GUILibrary/GUI.js"
import { Button } from "./GUILibrary/Button.js"
import { Draggable } from "./GUILibrary/Draggable.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement

var gui = new CanvasGUI(canvas)
window["gui"] = gui
gui.centerCoords = true

{
    let control = new Button()
    gui.addControl(control)
    control.rect = new Rect(-20, -20, 40, 40)
}
{
    let control = new Draggable()
    gui.addControl(control)
    control.rect = new Rect(0, 0, 40, 40)
}

function update() {
    gui.update()

    requestAnimationFrame(update)
}

update()