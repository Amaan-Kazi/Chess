import Board from "@/chess/board";

export default class Game {
  board: Board;
  moves: Board[];
  selection: number[] | null;
  validMoves: number[][];

  moveAudio?:        HTMLAudioElement;
  illegalMoveAudio?: HTMLAudioElement;
  captureAudio?:     HTMLAudioElement;
  gameEndAudio?:     HTMLAudioElement;
  checkAudio?:       HTMLAudioElement;
  castleAudio?:      HTMLAudioElement;

  constructor() {
    //this.board = new Board(undefined, "rnbqkbnr/p1pppppp/2N5/3BQ1R1/Pp2P3/K2P4/1PP2PPP/1NB4R w KQkq - 0 1");
    this.board = new Board(undefined, "rnbqkbnr/pppp1ppp/N7/Q6R/1KP5/1N2B3/PP1PPPPP/5B1R w - - 0 1");
    this.moves = [new Board(this.board)]; // stores copy of board instead of reference

    this.selection = null;
    this.validMoves = [];

    if (typeof window !== "undefined") {
      this.moveAudio        = new Audio("/chess/sounds/move-self.mp3");
      this.illegalMoveAudio = new Audio("/chess/sounds/illegal.mp3");
      this.captureAudio     = new Audio("/chess/sounds/capture.mp3");
      this.castleAudio      = new Audio("/chess/sounds/castle.mp3");
      this.checkAudio       = new Audio("/chess/sounds/move-check.mp3");
      this.gameEndAudio     = new Audio("/chess/sounds/game-end.mp3");
    }
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

    // If already selected a piece, and clicked on a valid move, then perform move
    if (this.validMoves.length > 0 && this.selection !== null) {
      for (const [r, c] of this.validMoves) {
        if (r === row && c === col) {
          const newBoard = new Board(this.board); // Make a copy
          const moveStatus = newBoard.move([this.selection!, [row, col]]);

          if (moveStatus !== "failed") {
            this.moves.push(new Board(this.board));
            this.board = newBoard;

            if (typeof window !== "undefined") {
              if      (moveStatus === "move")      this.moveAudio?.play();
              else if (moveStatus === "capture")   this.captureAudio?.play();
              else if (moveStatus === "castle")    this.castleAudio?.play();
              else if (moveStatus === "check")     this.checkAudio?.play();
              else if (moveStatus === "checkmate") this.gameEndAudio?.play();
            }
          }
          else if (typeof window !== "undefined") this.illegalMoveAudio?.play();

          break;
        }
      }
    }

    if (!piece) {
      this.selection = null;
      this.validMoves = [];
      return;
    }

    if (this.board.pieceColor(pos) == this.board.turn) {
      this.selection = pos;
      this.validMoves = pieceMoves[`${piece!.toLowerCase()}` as keyof typeof pieceMoves]([row, col]);
      return;
    }
    else {
      this.selection = null;
      this.validMoves = [];
      return;
    }
  }
}
