import Board from "@/chess/board";

export default class Game {
  board: Board;
  moves: Board[];

  constructor() {
    this.board = new Board();
    this.moves = [new Board(this.board)]; // stores copy of board instead of reference
  }
}
