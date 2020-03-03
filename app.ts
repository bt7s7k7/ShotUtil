import { CanvasGUI, GUIControl, Rect } from "./GUILibrary/GUI.js"
import { Button } from "./GUILibrary/Button.js"
import { Draggable } from "./GUILibrary/Draggable.js"
import { DraggableButton } from "./GUILibrary/DraggableButton.js"
import { UserResizable } from "./GUILibrary/UserResizable.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement
var pasteTarget = document.getElementById("pasteTarget") as HTMLInputElement

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
    pasteTarget.focus()
    pasteTarget.value = ""

    requestAnimationFrame(update)
}

pasteTarget.addEventListener("paste", (event) => {
    var files = [...event.clipboardData.files]
    files.forEach(v=>{
        var url = URL.createObjectURL(v)
        window.open(url)
    })
})

update()