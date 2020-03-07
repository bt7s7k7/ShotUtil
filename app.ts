import { CanvasGUI, Rect, Point } from "./GUILibrary/GUI.js"
import { ResizableSelectionManager } from "./GUILibrary/UserResizable.js"
import { UserResizableImage } from "./GUILibrary/UserResizableImage.js"
import { registerMouseMovement } from "./GUILibrary/mouseMovement.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement
var ctx = canvas.getContext("2d")
var pasteTarget = document.getElementById("pasteTarget") as HTMLInputElement
var selectionManager = new ResizableSelectionManager()

var gui = new CanvasGUI()
gui.registerListeners(canvas)
window["gui"] = gui
gui.centerCoords = true

gui.onBackgroundMouse = state=>{
    if(state.down[0]) {
        selectionManager.deselect()
    }
}
registerMouseMovement(gui, 0)

function update() {
    var size = new Rect(canvas.getBoundingClientRect()).origin()
    canvas.width = size.width
    canvas.height = size.height

    var offset = gui.update(ctx)

    
    const controls = gui.getControls()
    if (controls.length != 0) {
        var rect = getOutputRect(offset)

        ctx.strokeStyle = "#555555"
        ctx.strokeRect(...rect.spread())
    }

    gui.draw(ctx, offset)
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

function getOutputRect(offset: Point) {
    var minX = Infinity
    var minY = Infinity
    var maxX = -Infinity
    var maxY = -Infinity
    gui.getControls().forEach(v => {
        const screenRect = v.getScreenRect(offset)
        minX = Math.min(minX, screenRect.x)
        minY = Math.min(minY, screenRect.y)
        maxX = Math.max(maxX, screenRect.end().x)
        maxY = Math.max(maxY, screenRect.end().y)
    })
    return new Rect(minX, minY, maxX - minX, maxY - minY)
}
