/** A wrapper class for handling multithreaded async evaluations from any UCI engine */
export default class Engine {
  engine: Worker;

  /** Compute n number of bestMoves, default=1 */
  multiPV: number;
  
  /** +ve (white) or -ve (black) advantage score */
  evaluation: number;

  /** Number of full moves until closest forced mate, null if no forced mate */
  mateIn: number | null;

  /** Best move in form of [row, col] */
  bestMove: number[];

  /** A callback function that is called whenever some state updates, usefull for instantly updating UI */
  update?: () => void;

  pendingResolvers: { [key: string]: (value?: unknown) => void };

  /**
   * Creates an instance of Engine
   * @param engine_worker a Worker loaded with any chess engine
   * @param update Optional callback function called whenever important data is updated
   */
  constructor(engine_worker: Worker, update?: () => void) {
    this.engine = engine_worker;
    this.engine.onmessage = this.onmessage.bind(this);
    this.pendingResolvers = {}

    this.multiPV    = 1;
    this.evaluation = 0;
    this.mateIn     = null;
    this.bestMove   = [];

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

  async isReady() {
    return new Promise(resolve => {
      this.pendingResolvers.readyok = resolve;
      this.engine.postMessage("isready");
    })
  }

  onmessage(e: MessageEvent) {
    const data = e.data;

    if (data === "readyok") this.pendingResolvers.readyok();
  }
}
