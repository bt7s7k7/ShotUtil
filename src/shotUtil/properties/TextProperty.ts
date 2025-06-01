import { BoardObject } from "../board/BoardObject"
import { Property } from "./Property"

export class TextProperty extends Property<string, { text: string } & BoardObject> {
    public get value() {
        return this.owner.text
    }

    public set value(value) {
        this.owner.text = value
        if (this.owner.board) this.owner.flushChanges()
    }
}

export type VerticalAlign = "auto" | "middle" | "hanging"
export class VerticalAlignProperty extends Property<VerticalAlign, { verticalAlign: VerticalAlign } & BoardObject> {
    public get value() {
        return this.owner.verticalAlign
    }

    public set value(value) {
        this.owner.verticalAlign = value
        if (this.owner.board) this.owner.flushChanges()
    }
}

export type HorizontalAlign = "start" | "middle" | "end"
export class HorizontalAlignProperty extends Property<HorizontalAlign, { horizontalAlign: HorizontalAlign } & BoardObject> {
    public get value() {
        return this.owner.horizontalAlign
    }

    public set value(value) {
        this.owner.horizontalAlign = value
        if (this.owner.board) this.owner.flushChanges()
    }
} 
