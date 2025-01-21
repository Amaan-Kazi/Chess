import Board from "@/chess/board";

export default class Game {
  board: Board;
  moves: Board[];
  moveNo: number;
  moveNotations: string[];
  selection: number[] | null;
  validMoves: number[][];

  state: "ongoing" | "checkmate" | "stalemate" | "draw";
  stateDescription: string;

  evaluation: number;
  mateIn: number | null;
  stockfish: Worker | null;

  moveAudio?:        HTMLAudioElement;
  illegalMoveAudio?: HTMLAudioElement;
  captureAudio?:     HTMLAudioElement;
  gameEndAudio?:     HTMLAudioElement;
  checkAudio?:       HTMLAudioElement;
  castleAudio?:      HTMLAudioElement;
  promotionAudio?:   HTMLAudioElement;

  constructor(stockfish: Worker | null) {
    this.board = new Board(undefined, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    this.moves = [new Board(this.board)]; // stores copy of board instead of reference
    this.moveNo = 0;
    this.moveNotations = [];

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

    this.evaluation = 0;
    this.mateIn = null;

    this.stockfish = stockfish;
    if (this.stockfish) {
      this.stockfish.onmessage = this.handleStockfishResponse.bind(this);
      this.stockfish.postMessage("uci");
      this.evaluatePosition();
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

    if (this.state !== "ongoing") return;

    // If already selected a piece, and clicked on a valid move, then perform move
    if (this.validMoves.length > 0 && this.selection !== null) {
      for (const [r, c] of this.validMoves) {
        if (r === row && c === col) {
          const newBoard = new Board(this.board); // Make a copy
          const { moveStatus, moveNotation } = newBoard.move([this.selection!, [row, col], [metadata]]);

          if (moveStatus !== "failed") {
            this.board = newBoard;

            if (this.moveNo !== this.moves.length - 1) {
              for (let i = this.moves.length - 1; i > this.moveNo; i--) {
                this.moves.pop();
                this.moveNotations.pop();
              }
            }

            this.moves.push(new Board(this.board));
            this.moveNo++;

            this.moveNotations.push(moveNotation!);

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
              else if (moveStatus.startsWith("draw - ")) {
                this.state = "draw";
                this.stateDescription = "By " + moveStatus.slice(7);
                this.gameEndAudio?.play();
              }
            }

            if (this.stockfish)
            {
              console.clear();
              this.evaluatePosition();
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

  backward(): void {
    if (this.moves.length <= 1) return;

    if (this.moveNo > 0) {
      this.selection = null;
      this.validMoves = [];

      this.moveNo--;
      this.board = new Board(this.moves[this.moveNo]);

      console.clear();
      this.evaluatePosition();
    }
  }

  forward(): void {
    if (this.moves.length <= 1) return;

    if (this.moveNo < this.moves.length - 1) {
      this.selection = null;
      this.validMoves = [];
      
      this.moveNo++;
      this.board = new Board(this.moves[this.moveNo]);
      
      console.clear();
      this.evaluatePosition();
    }
  }

  peek(index: number): void {
    this.selection = null;
    this.validMoves = [];

    this.moveNo = index;
    this.board = new Board(this.moves[this.moveNo]);
  }


  evaluatePosition() {
    console.log(this.board.FEN())
    this.stockfish?.postMessage("ucinewgame");
    this.stockfish?.postMessage(`position fen ${this.board.FEN()}`);
    this.stockfish?.postMessage("go depth 10");
  }

  handleStockfishResponse(event: MessageEvent) {
    const data = event.data;
    console.log(data);

    // Handle Stockfish evaluation response
    if (data.startsWith("info") && data.includes("score")) {
      const scoreMatch = data.match(/score (cp|mate) (-?\d+)/);
      if (scoreMatch) {
        const [, type, value] = scoreMatch;
        if (type === "cp") {
          // Centipawn score (convert to evaluation range)
          this.evaluation = Math.max(-10, Math.min(10, (parseInt(value, 10) / 100))); // Convert centipawns to pawn units
          if(this.board.turn === 'b') this.evaluation = this.evaluation * -1;
          this.mateIn = null;
          console.log("Evaluation: ", this.evaluation);
        } else if (type === "mate") {
          // Mate in X moves (use a very high score to indicate win/loss)
          const mateIn = parseInt(value, 10);
          this.mateIn = mateIn < 0 ? mateIn * -1 : mateIn;
          console.log("Mate in ", mateIn);
          this.evaluation = mateIn > 0 ? 10 : -10; // Positive for White, negative for Black
          if(this.board.turn === 'b') this.evaluation = this.evaluation * -1;
          console.log("Evaluation: ", this.evaluation);
        }
      }
    }
  }
}
