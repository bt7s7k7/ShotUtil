import { CanvasGUI } from "./GUI.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement

var gui = new CanvasGUI(canvas)
window["gui"] = gui

function update() {
    requestAnimationFrame(update)
}

update()