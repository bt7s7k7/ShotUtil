import { CanvasGUI, Rect, Point } from "./GUILibrary/GUI.js"
import { ResizableSelectionManager, UserResizable } from "./GUILibrary/UserResizable.js"
import { UserResizableImage } from "./GUILibrary/UserResizableImage.js"
import { registerMouseMovement } from "./GUILibrary/mouseMovement.js"
import { ImageControl } from "./GUILibrary/ImageControl.js"

var canvas = document.getElementById("canvas") as HTMLCanvasElement
var ctx = canvas.getContext("2d")
var pasteTarget = document.getElementById("pasteTarget") as HTMLInputElement
var selectionManager = new ResizableSelectionManager()

var cropCanvas = document.getElementById("cropCanvas") as HTMLCanvasElement
var cropCtx = cropCanvas.getContext("2d")
var cropGUI = new CanvasGUI()
cropGUI.registerListeners(cropCanvas)
cropGUI.centerCoords = true
var cropRect = null as UserResizableImage
var oldCropRect = null as Rect
var oldPos = null as Point
var cropImageControl = null as ImageControl
var scaleX = 0
var scaleY = 0

cropGUI.onBackgroundMouse = (state) => {
    if (cropImageControl && state.down[0]) {
        cropImageControl.rect = cropImageControl.rect.translate(state.delta)
    }
}

var normalControls = document.getElementById("normalControls")
var cropControls = document.getElementById("cropControls")

var gui = new CanvasGUI()
gui.registerListeners(canvas)
window["gui"] = gui
gui.centerCoords = true

gui.onBackgroundMouse = state => {
    if (state.down[0]) {
        selectionManager.deselect()
    }
}
registerMouseMovement(gui, 0)

function update() {
    var size = new Rect(canvas.getBoundingClientRect()).origin()
    canvas.width = size.width
    canvas.height = size.height

    cropCanvas.width = size.width
    cropCanvas.height = size.height

    var offset = gui.update(ctx)

    const controls = gui.getControls()
    if (controls.length != 0) {
        var rect = getOutputRect(offset)

        ctx.strokeStyle = "#555555"
        ctx.strokeRect(...rect.spread())
    }

    gui.draw(ctx, offset)

    if (cropRect) {
        let offset = cropGUI.update(cropCtx)
        updateSelectedCropRect(selectionManager.getSelected())
        cropGUI.draw(cropCtx, offset)
    }

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
    if (cropRect) {
        if (event.key == "Enter" || event.key == "Escape" || event.key == "c") {
            normalControls.hidden = false
            cropControls.hidden = true
            cropCanvas.hidden = true
            selected.focus()

            updateSelectedCropRect(selected)

            cropRect.remove()
            cropRect = null
            cropImageControl.remove()
            cropImageControl = null
        } else if (event.key == "q") {
            cropRect.rect = cropImageControl.rect
        }
    } else {
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
        } else if (event.key == "c") {
            if (selected) {
                cropCanvas.hidden = false
                normalControls.hidden = true
                cropControls.hidden = false

                oldPos = selected.rect.pos()
                const selectedImage = (selected as UserResizableImage)
                oldCropRect = selectedImage.cropRect

                cropGUI.offset = gui.offset

                cropImageControl = new ImageControl()
                cropGUI.addControl(cropImageControl)
                const image = selectedImage.getImage()
                cropImageControl.image = image
                cropImageControl.opacity = 0.5

                cropImageControl.setMouseState = state => { cropGUI.onBackgroundMouse(state); return true }

                const imageWidth = image.width instanceof SVGAnimatedLength ? image.width.baseVal.value : image.width
                const imageHeight = image.height instanceof SVGAnimatedLength ? image.height.baseVal.value : image.height
                scaleX = selected.rect.width / selectedImage.cropRect.width
                scaleY = selected.rect.height / selectedImage.cropRect.height

                cropImageControl.rect = new Rect(selected.rect.x - oldCropRect.x * scaleX, selected.rect.y - oldCropRect.y * scaleY, imageWidth * scaleX, imageHeight * scaleY)

                cropRect = new UserResizableImage()
                cropRect.setImage(image)
                cropGUI.addControl(cropRect)
                cropRect.rect = selected.rect
                cropRect.preserveAspectRatio = false
                cropRect.cropRect = selectedImage.cropRect


                selected.blur()
            }
        }
    }
})

update()

function updateSelectedCropRect(selected: UserResizable) {
    selected.rect = cropRect.rect
    const selectedImage = (selected as UserResizableImage)
    const image = selectedImage.getImage()
    cropRect.cropRect = selectedImage.cropRect = new Rect((cropRect.rect.x - cropImageControl.rect.x) / scaleX, (cropRect.rect.y - cropImageControl.rect.y) / scaleY, cropRect.rect.width / scaleX, cropRect.rect.height / scaleY)
}

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
    return new Rect(minX - 1, minY - 1, maxX - minX + 1, maxY - minY + 1)
}
