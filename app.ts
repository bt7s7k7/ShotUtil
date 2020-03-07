import { CanvasGUI } from "./GUILibrary/GUI.js"
import { ResizableSelectionManager } from "./GUILibrary/UserResizable.js"
import { UserResizableImage } from "./GUILibrary/UserResizableImage.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement
var pasteTarget = document.getElementById("pasteTarget") as HTMLInputElement
var selectionManager = new ResizableSelectionManager()

var gui = new CanvasGUI(canvas)
window["gui"] = gui
gui.centerCoords = true

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
        var image = new Image()
        image.addEventListener("load", ()=>{
            var control = new UserResizableImage()
            control.setImage(image)
            control.focus()
            control.registerManager(selectionManager)
            selectionManager.select(control)
            gui.addControl(control)
        })
        image.src = url
    })
})

update()