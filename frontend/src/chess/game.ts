import Board from "@/chess/board";

export default class Game {
  board: Board;
  moves: Board[];
  moveNo: number;

  whitePlayer: string = "White";
  blackPlayer: string = "Black";
  
  moveNotations: string[];
  selection: number[] | null;
  validMoves: number[][];

  state: "ongoing" | "checkmate" | "stalemate" | "draw";
  stateDescription: string;

  evaluation: number;
  mateIn: number | null;
  stockfish: Worker | null;
  
  sound: {
    moveAudio?:        HTMLAudioElement,
    illegalMoveAudio?: HTMLAudioElement,
    captureAudio?:     HTMLAudioElement,
    gameEndAudio?:     HTMLAudioElement,
    checkAudio?:       HTMLAudioElement,
    castleAudio?:      HTMLAudioElement,
    promotionAudio?:   HTMLAudioElement,
  } = {};

  constructor(stockfish: Worker | null, PGN?: string) {
    this.board = new Board(undefined, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    this.moves = [new Board(this.board)]; // stores copy of board instead of reference
    this.moveNo = 0;
    this.moveNotations = [];

    this.selection = null;
    this.validMoves = [];

    this.state = "ongoing";
    this.stateDescription = "";

    if (PGN) {
      const metadata: { white?: string, black?: string } = {};
      
      PGN = PGN.replace(/\[(.*?)\]/g, (match: string, content: string) => {
        const [key, value]: string[] = content.split(' "');
        metadata[key.trim() as keyof typeof metadata] = value.replace(/"$/, '').trim();
        return ''; // Remove metadata from the PGN
      }).trim();
      
      PGN = PGN
        .replace(/\{[^}]*\}/g, '')                  // Remove comments          {}
        .replace(/\([^)]*\)/g, '')                  // Remove alternative lines ()
        .replace(/\d+\./g, '')                      // Remove move numbers      1. 2. 3.
        .replace(/\b(1-0|0-1|1\/2-1\/2|\*)\b/g, '') // Remove Result            * 1/0 1/2-1/2 0/1
      .trim();

      const notations = PGN.split(" ");
      const moveNotations: string[] = [];

      for (const notation of notations) {
        if (/^[A-Za-z]/.test(notation)) moveNotations.push(notation);
      }

      console.log(metadata);
      console.log(moveNotations);
    }

    if (typeof window !== "undefined") {
      this.sound = {
        moveAudio:         new Audio("/chess/sounds/move-self.mp3"),
        illegalMoveAudio:  new Audio("/chess/sounds/illegal.mp3"),
        captureAudio:      new Audio("/chess/sounds/capture.mp3"),
        castleAudio:       new Audio("/chess/sounds/castle.mp3"),
        checkAudio:        new Audio("/chess/sounds/move-check.mp3"),
        gameEndAudio:      new Audio("/chess/sounds/game-end.mp3"),
        promotionAudio:    new Audio("/chess/sounds/promote.mp3"),
      }
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
              if      (moveStatus === "move")      this.sound.moveAudio?.play();
              else if (moveStatus === "capture")   this.sound.captureAudio?.play();
              else if (moveStatus === "castle")    this.sound.castleAudio?.play();
              else if (moveStatus === "check")     this.sound.checkAudio?.play();
              else if (moveStatus === "promotion") this.sound.promotionAudio?.play();
              else if (moveStatus === "checkmate") {
                this.state = "checkmate";
                this.stateDescription = `${this.board.turn === 'b' ? "White" : "Black"} Wins`
                this.sound.gameEndAudio?.play();
              }
              else if (moveStatus.startsWith("draw - ")) {
                this.state = "draw";
                this.stateDescription = "By " + moveStatus.slice(7);
                this.sound.gameEndAudio?.play();
              }
            }

            if (this.stockfish)
            {
              // console.clear();
              this.evaluatePosition();
            }
          }
          else if (typeof window !== "undefined") this.sound.illegalMoveAudio?.play();

          break;
        }
      }
    }

    // Empty Square Clicked
    if (!piece) {
      this.selection = null;
      this.validMoves = [];
      return;
    }

    // if selected piece color = player turn color, then get and store all valid moves
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

  
  backward(): void {
    if (this.moves.length <= 1) return;

    if (this.moveNo > 0) {
      this.selection = null;
      this.validMoves = [];

      this.moveNo--;
      this.board = new Board(this.moves[this.moveNo]);

      // console.clear();
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
      
      // console.clear();
      this.evaluatePosition();
    }
  }

  peek(index: number): void {
    this.selection = null;
    this.validMoves = [];

    this.moveNo = index;
    this.board = new Board(this.moves[this.moveNo]);

    // console.clear();
    this.evaluatePosition();
  }


  evaluatePosition() {
    // console.log(this.board.FEN())
    this.stockfish?.postMessage("ucinewgame");
    this.stockfish?.postMessage(`position fen ${this.board.FEN()}`);
    this.stockfish?.postMessage("go depth 10");
  }

  handleStockfishResponse(event: MessageEvent) {
    const data = event.data;
    // console.log(data);

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
          // console.log("Evaluation: ", this.evaluation);
        } else if (type === "mate") {
          // Mate in X moves (use a very high score to indicate win/loss)
          const mateIn = parseInt(value, 10);
          this.mateIn = mateIn < 0 ? mateIn * -1 : mateIn;
          // console.log("Mate in ", mateIn);
          this.evaluation = mateIn > 0 ? 10 : -10; // Positive for White, negative for Black
          if(this.board.turn === 'b') this.evaluation = this.evaluation * -1;
          // console.log("Evaluation: ", this.evaluation);
        }
      }
    }
  }


  PGN(): string {
    const currentDate = () => {
      const now = new Date();
      return `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
    };

    let result: string = "*";
    if      (this.state === "ongoing") result = "*";
    else if (this.state === "checkmate") {
      if      (this.stateDescription === "White Wins") result = "1-0";
      else if (this.stateDescription === "Black Wins") result = "0-1";
    }
    else result = "1/2-1/2";

    let PGN: string =
`[Event "?"]
[Site "https://chess.amaankazi.is-a.dev"]
[Date "${currentDate()}"]
[Round "1"]
[White "${this.whitePlayer}"]
[Black "${this.blackPlayer}"]
[Result "${result}"]`.replace("\t", "");

    let notations: string = "";
    let notationNo: number = 1;

    for (let i = 0; i < this.moveNotations.length; i++) {
      if (i % 6 === 0) notations = notations.concat("\n");
      
      if (i % 2 === 0) {
        notations = notations.concat(`${notationNo}. `);
        notationNo += 1;
      }

      notations = notations.concat(this.moveNotations[i], " ");
    }

    PGN = PGN.concat("\n", notations, result);
    return PGN;
  }
}
