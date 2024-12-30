import Board from "@/chess/board";

export default class Game {
  board: Board;
  moves: Board[];
  selection: number[] | null;
  validMoves: number[][] | null;

  constructor() {
    this.board = new Board(undefined, "rnbqkbnr/pppppppp/8/4R3/8/8/PPPPPPPP/1NBQKBNR w KQkq - 0 1");
    this.moves = [new Board(this.board)]; // stores copy of board instead of reference

    this.selection = null;
    this.validMoves = [];
  }
}
