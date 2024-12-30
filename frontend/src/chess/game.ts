import Board from "@/chess/board";

export default class Game {
  board: Board;
  moves: Board[];
  selection: number[] | null;
  validMoves: number[][];

  constructor() {
    this.board = new Board(undefined, "rnbqkbnr/pppppppp/8/3BR3/8/8/PPPPPPPP/1NBQK1NR w KQkq - 0 1");
    this.moves = [new Board(this.board)]; // stores copy of board instead of reference

    this.selection = null;
    this.validMoves = [];
  }

  
  select(pos: number[]) {
    const [row, col] = pos;
    const piece = this.board.grid[row][col];

    const pieceMoves = {
      'r': this.board.rookMoves.bind(this.board),
      'b': this.board.bishopMoves.bind(this.board),
    };

    if (!piece) {
      this.selection = null;
      this.validMoves = [];
      return;
    }

    if (this.board.pieceColor(pos) == this.board.turn) {
      this.selection = pos;
      this.validMoves = pieceMoves[`${piece.toLowerCase()}` as keyof typeof pieceMoves]([row, col]);
      return;
    }
    else {
      this.selection = null;
      this.validMoves = [];
      return;
    }
  }
}
