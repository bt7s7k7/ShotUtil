import { UserResizable } from "./UserResizable.js"


export interface IShapeStyle {
    color: string,
    lineWidth: number
}

export const DEFAULT_SHAPE_STYLE = {
    color: "#ff0000",
    lineWidth: 2
} as IShapeStyle

export class UserResizableShape extends UserResizable {
    public shapeStyle = DEFAULT_SHAPE_STYLE

    openColorDialog() {
        var dialog = document.createElement("input")
        dialog.type = "color"
        dialog.value = this.shapeStyle.color
        dialog.addEventListener("change", () => {
            this.shapeStyle = Object.assign({}, this.shapeStyle, { color: dialog.value })
        })
        dialog.click()
    }
}