import Board from "@/chess/board";

export default class Game {
  board: Board;
  moves: Board[];
  selection: number[] | null;
  validMoves: number[][];

  constructor() {
    this.board = new Board(undefined, "rnbqkbnr/p1pppppp/1KN5/3BQ1R1/Pp2P3/3P4/1PP2PPP/1NB4R b KQkq - 0 1");
    this.moves = [new Board(this.board)]; // stores copy of board instead of reference

    this.selection = null;
    this.validMoves = [];
  }

  
  select(pos: number[]) {
    const [row, col] = pos;
    const piece = this.board.grid[row][col];

    const pieceMoves = {
      'k': this.board.kingMoves.bind(this.board),
      'q': this.board.queenMoves.bind(this.board),
      'r': this.board.rookMoves.bind(this.board),
      'b': this.board.bishopMoves.bind(this.board),
      'n': this.board.knightMoves.bind(this.board),
      'p': this.board.pawnMoves.bind(this.board),
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
