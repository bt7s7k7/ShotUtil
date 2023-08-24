import { Color } from "../../drawer/Color"
import { BoxShape } from "./BoxShape"

export class SolidColorShape extends BoxShape {
    public color = Color.black

    public draw(): void {
        this.editor.drawer.setStyle(this.color).fillRect(this.rect)
    }
}
