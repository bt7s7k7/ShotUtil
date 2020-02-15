import { CanvasGUI, GUIControl, Rect } from "./GUILibrary/GUI.js"
import { Button } from "./GUILibrary/Button.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement

var gui = new CanvasGUI(canvas)
window["gui"] = gui
gui.centerCoords = true

{
    let control = new Button()
    gui.addControl(control)
    control.rect = new Rect(-10, -10, 20, 20)
}

function update() {
    gui.update()

    requestAnimationFrame(update)
}

update()