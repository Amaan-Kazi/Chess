/** A wrapper class for handling multithreaded async evaluations from any UCI engine */
export default class Engine {
  private engine: Worker;

  /** The depth for recursion to compute moves, default = 10 */
  depth: number;
  /** Compute n number of bestMoves, default = 1 */
  multiPV: number;
  /** Turn */
  turn: "white" | "black";
  
  /** +ve (white) or -ve (black) advantage score */
  evaluation: number[];
  /** Number of full moves until closest forced mate, null if no forced mate */
  mateIn: (number | null)[];
  /** Best move in form of [row, col] */
  bestMove: string | null;
  /** The move most likely to be played by the opponent */
  ponder: string | null;
  /** Principal Variations */
  principalVariations: string[][]
  /** Current depth the engine has evlauted till */
  currentDepth: number;

  /** A callback function that is called whenever some state updates, usefull for instantly updating UI */
  update?: () => void;

  pendingResolvers: { [key: string]: (value?: unknown) => void };

  /**
   * Creates an instance of Engine
   * @param engine_worker a Worker loaded with any chess engine
   * @param depth The depth depth for recursion to compute moves, default = 10
   * @param multiPV Compute n number of bestMoves, default = 1
   * @param update Optional callback function called whenever important data is updated
   */
  constructor(engine_worker: Worker, depth: number = 10, multiPV: number = 1, update?: () => void) {
    this.engine = engine_worker;
    this.engine.onmessage = this.onmessage.bind(this);
    this.pendingResolvers = {};

    this.depth   = depth;
    this.multiPV = multiPV;
    this.turn    = "white";

    this.evaluation = [ 0 ];
    this.mateIn     = [ null ];
    this.ponder     = null;
    this.bestMove   = null;
    this.principalVariations = [ [] ];
    this.currentDepth = 0;

    this.update = update;
  }

  /** Initializes UCI for the engine */
  async init() {
    this.engine.postMessage("uci");
    await this.isReady();

    this.engine.postMessage("ucinewgame");
    await this.isReady();

    this.engine.postMessage(`setoption name MultiPV value ${this.multiPV}`);
    await this.isReady();
  }


  setDepth(depth: number) {
    this.depth = depth;
  }

  async setMultiPV(multiPV: number) {
    if (multiPV < 1) multiPV = 1;
    
    this.engine.postMessage(`setoption name MultiPV value ${multiPV}`);
    await this.isReady();

    this.multiPV = multiPV;
  }


  /**
   * @param FEN Chess board FEN
   * @returns Promise that is resolved once the position is fully evaluated until set depth
   */
  async evaluate(FEN: string) {
    return new Promise(resolve => {
      this.turn = FEN.split(" ")[1] === "w" ? "white" : "black";

      this.bestMove = null;
      this.ponder   = null;

      this.engine.postMessage("stop");
      this.engine.postMessage(`position fen ${FEN}`);

      this.engine.postMessage(`go depth ${this.depth}`);
      this.pendingResolvers.evaluated = resolve;
    });
  }

  onmessage(e: MessageEvent) {
    const data = e.data;

    if (data === "readyok") this.pendingResolvers.readyok();

    if (data.startsWith("info depth")) {
      // eg. info depth 5 seldepth 5 multipv 2 score cp 12 nodes 933 nps 233250 hashfull 0 tbhits 0 time 4 pv b1c3 e7e5 e2e4 c7c6
      // eg. info depth 5 seldepth 5 multipv 2 score mate 2 nodes 933 nps 233250 hashfull 0 tbhits 0 time 4 pv b1c3 e7e5 e2e4 c7c6
      const tokens: string[] = data.split(" ");

      const depthIndex   = tokens.indexOf("depth");
      const multiPVIndex = tokens.indexOf("multipv");
      const scoreIndex   = tokens.indexOf("score");
      const pvIndex      = tokens.indexOf("pv");

      if (depthIndex!== -1 && scoreIndex !== -1) {
        this.currentDepth = Number(tokens[depthIndex + 1]);
        const index = multiPVIndex === -1 ? 0 : Number(tokens[multiPVIndex + 1]) - 1;

        if (tokens[scoreIndex + 1] === "cp") {
          const centipawns = Number(tokens[scoreIndex + 2]);
          let pawns = centipawns / 100; // 100cp = 1p

          // Limit evaluation from +10 to -10 and make advantage -ve for black
          pawns = Math.max(-10, Math.min(10, pawns));
          pawns = pawns * (this.turn === "white" ? 1 : -1);

          this.evaluation[index] = pawns;
          this.mateIn[index] = null;
        }
        else if (tokens[scoreIndex + 1] === "mate") {
          const mateIn = Number(tokens[scoreIndex + 2]);
          this.mateIn[index] = mateIn * (this.turn === "white" ? 1 : -1);
          this.evaluation[index] = 10 * (this.turn === "white" ? 1 : -1) * (mateIn === 0 ? -1 : 1);
        }

        if (pvIndex !== -1) {
          this.principalVariations[index] = [];
          let variationsIndex = 0;

          for (let i = pvIndex + 1; i < tokens.length; i++) {
            if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(tokens[i])) break;
            this.principalVariations[index][variationsIndex] = tokens[i];
            variationsIndex++;
          }
        }

        this.update?.();
      }
    }

    if (data.startsWith("bestmove")) {
      // eg. bestmove e2e4 ponder g8f6
      const tokens: string[] = data.split(" ");

      const bestMoveIndex = tokens.indexOf("bestmove");
      const ponderIndex   = tokens.indexOf("ponder");

      if (bestMoveIndex !== -1) this.bestMove = tokens[bestMoveIndex + 1];
      else                      this.bestMove = null;
      if (this.bestMove === "(none)") this.bestMove = null;

      if (ponderIndex !== -1) this.ponder = tokens[ponderIndex + 1];
      else                    this.ponder = null;
      
      this.pendingResolvers.evaluated();
      this.update?.();
    }
  }


  async isReady() {
    return new Promise(resolve => {
      this.pendingResolvers.readyok = resolve;
      this.engine.postMessage("isready");
    });
  }


  print() {
    console.clear();
    let index = 0;
    const variations: string[] = [];

    // MultiPV
    for (const multiPV of this.principalVariations) {
      variations[index] = "";

      for (const pv of multiPV) {
        variations[index] += ` ${pv}`;
      }

      let score: string = "" + this.evaluation[index];
      
      if (this.evaluation[index] > 0) {
        if      (this.mateIn[index] === null) score = "+" + this.evaluation[index];
        else if (this.mateIn[index] === 0)    score = "1-0";
        else                                  score = "M" + this.mateIn[index];
      }
      else if (this.evaluation[index] < 0) {
        if      (this.mateIn[index] === null) score = "" + this.evaluation[index];
        else if (this.mateIn[index] === 0)    score = "0-1";
        else                                  score = "-M" + Math.abs(this.mateIn[index]!);
      }

      console.log(score + (variations[index] === "" ? "" : " |" + variations[index]));
      index++;
    }

    const bestMove = this.bestMove === null ? "" : " | Best Move: " + this.bestMove;
    const ponder = this.ponder === null ? "" : " | Ponder: " + this.ponder;
    console.log("Depth: " + this.currentDepth + bestMove + ponder);
  }
}
