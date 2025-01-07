import Board from "@/chess/board";

export default class Game {
  board: Board;
  moves: Board[];
  selection: number[] | null;
  validMoves: number[][];
  state: "ongoing" | "checkmate" | "stalemate" | "draw";
  stateDescription: string;

  moveAudio?:        HTMLAudioElement;
  illegalMoveAudio?: HTMLAudioElement;
  captureAudio?:     HTMLAudioElement;
  gameEndAudio?:     HTMLAudioElement;
  checkAudio?:       HTMLAudioElement;
  castleAudio?:      HTMLAudioElement;
  promotionAudio?:   HTMLAudioElement;

  constructor() {
    this.board = new Board(undefined, "1r6/8/8/K7/3q4/8/7k/8 b - - 0 1");
    this.moves = [new Board(this.board)]; // stores copy of board instead of reference

    this.selection = null;
    this.validMoves = [];

    this.state = "ongoing";
    this.stateDescription = "";

    if (typeof window !== "undefined") {
      this.moveAudio        = new Audio("/chess/sounds/move-self.mp3");
      this.illegalMoveAudio = new Audio("/chess/sounds/illegal.mp3");
      this.captureAudio     = new Audio("/chess/sounds/capture.mp3");
      this.castleAudio      = new Audio("/chess/sounds/castle.mp3");
      this.checkAudio       = new Audio("/chess/sounds/move-check.mp3");
      this.gameEndAudio     = new Audio("/chess/sounds/game-end.mp3");
      this.promotionAudio   = new Audio("/chess/sounds/promote.mp3");
    }
  }

  
  select(pos: number[]) {
    const [row, col, metadata] = pos;
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
          const moveStatus = newBoard.move([this.selection!, [row, col], [metadata]]);

          if (moveStatus !== "failed") {
            this.moves.push(new Board(this.board));
            this.board = newBoard;

            if (typeof window !== "undefined") {
              if      (moveStatus === "move")      this.moveAudio?.play();
              else if (moveStatus === "capture")   this.captureAudio?.play();
              else if (moveStatus === "castle")    this.castleAudio?.play();
              else if (moveStatus === "check")     this.checkAudio?.play();
              else if (moveStatus === "promotion") this.promotionAudio?.play();
              else if (moveStatus === "checkmate") {
                this.state = "checkmate";
                this.stateDescription = `${this.board.turn === 'b' ? "White" : "Black"} Wins`
                this.gameEndAudio?.play();
              }
              else if (moveStatus === "stalemate") {
                this.state = "draw";
                this.stateDescription = `By Stalemate`
                this.gameEndAudio?.play();
              }
            }
          }
          else if (typeof window !== "undefined") this.illegalMoveAudio?.play();

          break;
        }
      }
    }

    // Empty Square
    if (!piece) {
      this.selection = null;
      this.validMoves = [];
      return;
    }

    if (this.board.pieceColor(pos) == this.board.turn) { // selected piece color = player turn color
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
