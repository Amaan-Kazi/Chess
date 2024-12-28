import Board from "@/chess/board";

export default class Game {
  board: Board;

  constructor() {
    this.board = new Board(); 
  }
}
