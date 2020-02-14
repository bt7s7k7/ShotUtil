import { CanvasGUI, GUIControl, Rect } from "./GUI.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement

var gui = new CanvasGUI(canvas)
window["gui"] = gui
gui.centerCoords = true

{
    let control = new GUIControl()
    gui.addControl(control)
    control.rect = new Rect(-10, -10, 20, 20)
}

function update() {
    gui.update()

    requestAnimationFrame(update)
}

update()