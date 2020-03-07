import { CanvasGUI, Rect } from "./GUILibrary/GUI.js"
import { ResizableSelectionManager } from "./GUILibrary/UserResizable.js"
import { UserResizableImage } from "./GUILibrary/UserResizableImage.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement
var pasteTarget = document.getElementById("pasteTarget") as HTMLInputElement
var selectionManager = new ResizableSelectionManager()

var gui = new CanvasGUI(canvas)
window["gui"] = gui
gui.centerCoords = true

function update() {
    var size = new Rect(canvas.getBoundingClientRect()).origin()
    canvas.width = size.width
    canvas.height = size.height

    gui.update()
    pasteTarget.focus()
    pasteTarget.value = ""

    requestAnimationFrame(update)
}

pasteTarget.addEventListener("paste", (event) => {
    var files = [...event.clipboardData.files]
    files.forEach(v => {
        var url = URL.createObjectURL(v)
        var image = new Image()
        image.addEventListener("load", () => {
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

window.addEventListener("keydown", event => {
    const selected = selectionManager.getSelected()
    if (event.key == "Delete" || event.key == "q") {
        selected?.remove()
    } else if (event.key == "w") {
        selected?.toFront()
    } else if (event.key == "s") {
        selected?.toBack()
    } else if (event.key == "d") {
        if (selected) {
            const copy = selected.copy()
            selectionManager.select(copy)
            gui.addControl(copy)
        }
    } else if (event.key == "x") {
        gui.getControls().slice().forEach(v => v.remove())
    }
})

update()