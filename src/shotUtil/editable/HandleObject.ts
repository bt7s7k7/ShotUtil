import { EditableObject } from "./EditableObject"


export abstract class HandleObject {
    public abstract getElement(): SVGElement
    public abstract flush(): void

    constructor(
        public readonly owner: EditableObject,
    ) { }
}
