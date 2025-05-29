import { Board } from "./Board"

export abstract class BoardObject {
    public board: Board = null!

    public abstract setSelectedState(selected: boolean): void
    public abstract flushChanges(): void
    public init(board: Board) {
        this.board = board
    }
    public teardown() { }
}
