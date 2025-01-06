export default class Board {
  grid: (string | null)[][];
  turn: 'w' | 'b';
  castlingRights: { white: { kingSide: boolean; queenSide: boolean }, black: { kingSide: boolean; queenSide: boolean } };
  enPassant: number[] | null; // e.g., "e3" if black just moved a pawn two squares forward.
  halfMoveClock: number;
  fullMoveNumber: number;
  gameState: "ongoing" | "checkmate" | "stalemate" | "draw";
  prevMove: number[][];

  constructor(copyBoard?: Board, FEN?: string) {
    if (copyBoard) {
      this.grid = JSON.parse(JSON.stringify(copyBoard.grid)); // Deep copy of the grids

      this.castlingRights = {
        white: { kingSide: copyBoard.castlingRights.white.kingSide, queenSide: copyBoard.castlingRights.white.queenSide },
        black: { kingSide: copyBoard.castlingRights.black.kingSide, queenSide: copyBoard.castlingRights.black.queenSide },
      };

      this.turn           = copyBoard.turn;
      this.enPassant      = copyBoard.enPassant;
      this.halfMoveClock  = copyBoard.halfMoveClock;
      this.fullMoveNumber = copyBoard.fullMoveNumber;
      this.gameState      = copyBoard.gameState;
      this.prevMove       = [];
    }
    else if (FEN) {
      const [
        piecePlacement,
        activeColor,
        castlingRightsString,
        enPassant,
        halfMoveClock,
        fullMoveNumber,
      ]: string[] = FEN.split(' ');

      this.turn = activeColor === 'w' ? 'w' : 'b' ;

      const rows: string[] = piecePlacement.split('/');
      this.grid = Array(8).fill(null).map(() => Array(8).fill(null));

      // Parse piece placement
      for (let i = 0; i < 8; i++) {
        let col = 0;
        for (const char of rows[i]) {
          if (/\d/.test(char)) { // \d is used to match numbers
            // Handle empty squares (number specifies count of empty squares)
            col += parseInt(char, 10);
          } else {
            // Handle piece characters
            this.grid[i][col] = char;
            col++;
          }
        }
      }

      // Parse castling rights
      this.castlingRights = {
        white: {
          kingSide:  castlingRightsString.includes('K'),
          queenSide: castlingRightsString.includes('Q'),
        },
        black: {
          kingSide:  castlingRightsString.includes('k'),
          queenSide: castlingRightsString.includes('q'),
        },
      };

      // Parse en passant target square
      const rowNums = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7}; 
      this.enPassant = enPassant === "-" ? null : [rowNums[enPassant.charAt(0) as keyof typeof rowNums], parseInt(enPassant.charAt(0))];

      // Parse half-move clock and full-move number
      this.halfMoveClock  = parseInt(halfMoveClock, 10);
      this.fullMoveNumber = parseInt(fullMoveNumber, 10);

      // Set game state to ongoing by default
      this.gameState = "ongoing";

      this.prevMove = [];
    }
    else {      
      this.grid = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        Array(8).fill('p'),
        ...Array(4).fill(Array(8).fill(null)), // Four rows of null
        Array(8).fill('P'),
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
      ];

      this.castlingRights = {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true },
      };

      this.turn           = 'w';
      this.enPassant      = null;
      this.halfMoveClock  = 0;
      this.fullMoveNumber = 1;
      this.gameState      = "ongoing";
      this.prevMove       = [];
    }
  }


  // Move Metadata
  //   0: Move
  //   1: Capture
  // 100: Pawn Double Move
  // 101: En Passant
  // 200: Castle King Side
  // 201: Castle Queen Side
  // 300: Promotion - Queen
  // 301: Promotion - Knight
  // 302: Promotion - Rook
  // 303: Promotion - Bishop

  move(move: number[][]): "failed" | "move" | "capture" | "castle" | "promotion" | "check" | "checkmate" {
    const [[fromRow, fromCol], [toRow, toCol]] = move;
    let metadata: number = 0;

    const pieceMoves = {
      'k': this.kingMoves.bind(this),
      'q': this.queenMoves.bind(this),
      'r': this.rookMoves.bind(this),
      'b': this.bishopMoves.bind(this),
      'n': this.knightMoves.bind(this),
      'p': this.pawnMoves.bind(this),
    };

    if (!this.isInBounds(fromRow, fromCol) || !this.isInBounds(toRow, toCol)) return "failed"; // Bounds check
    if (this.grid[fromRow][fromCol] === null)                                 return "failed"; // piece check

    const piece = this.grid[fromRow][fromCol];
    if (this.turn === this.pieceColor([fromRow, fromCol])) { // piece color check
      const moves = pieceMoves[piece!.toLowerCase() as keyof typeof pieceMoves]([fromRow, fromCol]);
      let isValidMove = false;

      for (const [r, c, m] of moves) {
        if (r === toRow && c === toCol) {
          isValidMove = true;
          metadata = m;
          break;
        }
      }

      if (!isValidMove) return "failed";

      let status: "failed" | "move" | "capture" | "castle" | "promotion" | "check" | "checkmate" = "move";
      if (this.grid[toRow][toCol] !== null) status = "capture";      

      this.grid[toRow][toCol] = this.grid[fromRow][fromCol];
      this.grid[fromRow][fromCol] = null;

      // Pawn Double Move
      this.enPassant = null;
      if (metadata === 100) this.enPassant = [(fromRow + toRow) / 2, fromCol]; // row is in between from row and to row

      // En passant
      if (metadata === 101) {
        this.grid[fromRow][toCol] = null; // capture the piece
        status = "capture";
      }
        
      // Promotion
      if (metadata >= 300 && metadata <= 303) {
        if      (metadata === 300) this.grid[toRow][toCol] = this.turn === 'w' ? 'Q' : 'q';
        else if (metadata === 301) this.grid[toRow][toCol] = this.turn === 'w' ? 'N' : 'n';
        else if (metadata === 302) this.grid[toRow][toCol] = this.turn === 'w' ? 'R' : 'r';
        else if (metadata === 303) this.grid[toRow][toCol] = this.turn === 'w' ? 'B' : 'b';

        status = "promotion";
      }

      // castling rights

      // check for checkmate, stalemate, draw, etc

      if (this.turn === 'b') this.fullMoveNumber++;
      this.halfMoveClock++; // set to 0 when a pawn is moved or piece is captured
      this.turn = this.turn === 'w' ? 'b' : 'w';
      this.prevMove = [[fromRow, fromCol], [toRow, toCol]];

      if (this.isCheck(this.turn)) status = "check";

      return status;
    }

    return "failed";
  }


  kingMoves(pos: number[]): number[][] {
    const [row, col] = pos;
    const validMoves: number[][] = [];
    const safeValidMoves: number[][] = [];
    const color = this.pieceColor(pos);

    const directions = [
      [-1, -1], // Up Left
      [-1,  0], // Up
      [-1,  1], // Up Right

      [0,  -1], // Left
      [0,   1], // Right

      [1,  -1], // Down Left
      [1,   0], // Down
      [1,   1], // Down Right
    ];

    for (const [dRow, dCol] of directions) {
      const i = row + dRow;
      const j = col + dCol;

      if (!this.isInBounds(i, j)) continue;

      if      (this.grid[i][j] === null)          validMoves.push([i, j, 0]); // empty square
      else if (this.pieceColor([i, j]) !== color) validMoves.push([i, j, 1]); // enemy piece
    }

    for (const [toRow, toCol, metadata] of validMoves) {
      if(this.isSafeMove([[row, col], [toRow, toCol], [metadata]])) safeValidMoves.push([toRow, toCol, metadata]);
    }
    return safeValidMoves;
  }

  queenMoves(pos: number[]): number[][] {
    // Queen moves are a combination of rook and bishop moves
    return [...this.rookMoves(pos), ...this.bishopMoves(pos)];
  }

  rookMoves(pos: number[]): number[][] {
    const [row, col] = pos;
    const validMoves: number[][] = [];
    const safeValidMoves: number[][] = [];
    const color = this.pieceColor(pos);

    const directions = [
      [1,  0], // Down
      [-1, 0], // Up
      [0,  1], // Right
      [0, -1], // Left
    ];

    for (const [dRow, dCol] of directions) {
      let i = row + dRow;
      let j = col + dCol;

      while (this.isInBounds(i, j)) {
        if      (this.grid[i][j] === null)            validMoves.push([i, j, 0]);          // empty square
        else if (this.pieceColor([i, j]) !== color) { validMoves.push([i, j, 1]); break; } // enemy piece
        else break;                                                                        // friendly piece
        
        i += dRow;
        j += dCol;
      }
    }

    for (const [toRow, toCol, metadata] of validMoves) {
      if(this.isSafeMove([[row, col], [toRow, toCol], [metadata]])) safeValidMoves.push([toRow, toCol, metadata]);
    }
    return safeValidMoves;
  }

  bishopMoves(pos: number[]): number[][] {
    const [row, col] = pos;
    const validMoves: number[][] = [];
    const safeValidMoves: number[][] = [];
    const color = this.pieceColor(pos);

    const directions = [
      [1,   1], // Down Right
      [1,  -1], // Down Left
      [-1,  1], // Up Right
      [-1, -1], // Up Left
    ];

    for (const [dRow, dCol] of directions) {
      let i = row + dRow;
      let j = col + dCol;

      while (this.isInBounds(i, j)) {
        if      (this.grid[i][j] === null)            validMoves.push([i, j, 0]);          // empty square
        else if (this.pieceColor([i, j]) !== color) { validMoves.push([i, j, 1]); break; } // enemy piece
        else break;                                                                        // friendly piece

        i += dRow;
        j += dCol;
      }
    }

    for (const [toRow, toCol, metadata] of validMoves) {
      if(this.isSafeMove([[row, col], [toRow, toCol], [metadata]])) safeValidMoves.push([toRow, toCol, metadata]);
    }
    return safeValidMoves;
  }

  knightMoves(pos: number[]): number[][] {
    const [row, col] = pos;
    const validMoves: number[][] = [];
    const safeValidMoves: number[][] = [];
    const color = this.pieceColor(pos);

    const isValid = (row: number, col: number): void => {
      if (!this.isInBounds(row, col))            return;
      if (this.pieceColor([row, col]) === color) return;
      validMoves.push([row, col, this.grid[row][col] === null ? 0 : 1]);
    };

    isValid(row + 2, col + 1); // Down Right
    isValid(row + 2, col - 1); // Down Left

    isValid(row - 2, col + 1); // Up Right
    isValid(row - 2, col - 1); // Up Left

    isValid(row + 1, col + 2); // Right Down
    isValid(row + 1, col - 2); // Left Down

    isValid(row - 1, col + 2); // Right Up
    isValid(row - 1, col - 2); // Left Up

    for (const [toRow, toCol, metadata] of validMoves) {
      if(this.isSafeMove([[row, col], [toRow, toCol], [metadata]])) safeValidMoves.push([toRow, toCol, metadata]);
    }
    return safeValidMoves;
  }

  pawnMoves(pos: number[]): number[][] {
    const [row, col] = pos;
    const validMoves: number[][] = [];
    const safeValidMoves: number[][] = [];
    const color = this.pieceColor(pos);
    const direction = color === 'w' ? -1 : 1;

    // Single Move
    const sRow = row + direction;
    const sCol = col;
    if (this.isInBounds(sRow, sCol)) {
      if (this.grid[sRow][sCol] === null && (sRow === 0 || sRow === 7)) { // Promotion
        validMoves.push([sRow, sCol, 300]); // Queen
        validMoves.push([sRow, sCol, 301]); // Knight
        validMoves.push([sRow, sCol, 302]); // Rook
        validMoves.push([sRow, sCol, 303]); // Bishop
      }
      else if (this.grid[sRow][sCol] === null) validMoves.push([sRow, sCol, 0]);
    }

    // Double Move
    if ((row === 6 && color === 'w') || (row === 1 && color === 'b')) {
      const dRow = row + (2 * direction);
      const dCol = col;

      if (this.grid[sRow][sCol] === null && this.grid[dRow][dCol] === null) validMoves.push([dRow, dCol, 100]);
    }

    // Capture
    const cRow = row + direction;
    const cCol1 = col + 1; // Right
    const cCol2 = col - 1; // Left
    if (this.isInBounds(cRow, cCol1)) {
      if (this.grid[cRow][cCol1] !== null && this.pieceColor([cRow, cCol1]) !== color && (cRow === 0 || cRow === 7)) { // Capture Promotion
        validMoves.push([cRow, cCol1, 300]); // Queen
        validMoves.push([cRow, cCol1, 301]); // Knight
        validMoves.push([cRow, cCol1, 302]); // Rook
        validMoves.push([cRow, cCol1, 303]); // Bishop
      }
      else if (this.grid[cRow][cCol1] !== null && this.pieceColor([cRow, cCol1]) !== color)                                             validMoves.push([cRow, cCol1, 1]);   // Diagonal Capture
      else if (this.grid[cRow][cCol1] === null && this.enPassant !== null && this.enPassant[0] === cRow && this.enPassant[1] === cCol1) validMoves.push([cRow, cCol1, 101]); // En Passant
    }
    if (this.isInBounds(cRow, cCol2)) {
      if (this.grid[cRow][cCol2] !== null && this.pieceColor([cRow, cCol2]) !== color && (cRow === 0 || cRow === 7)) { // Capture Promotion
        validMoves.push([cRow, cCol2, 300]); // Queen
        validMoves.push([cRow, cCol2, 301]); // Knight
        validMoves.push([cRow, cCol2, 302]); // Rook
        validMoves.push([cRow, cCol2, 303]); // Bishop
      }
      else if (this.grid[cRow][cCol2] !== null && this.pieceColor([cRow, cCol2]) !== color)                                             validMoves.push([cRow, cCol2, 1]);   // Diagonal Capture
      else if (this.grid[cRow][cCol2] === null && this.enPassant !== null && this.enPassant[0] === cRow && this.enPassant[1] === cCol2) validMoves.push([cRow, cCol2, 101]); // En Passant
    }

    for (const [toRow, toCol, metadata] of validMoves) {
      if(this.isSafeMove([[row, col], [toRow, toCol], [metadata]])) safeValidMoves.push([toRow, toCol, metadata]);
    }
    return safeValidMoves;
  }


  pieceColor(pos: number[]): 'w' | 'b' | null {
    const [row, col] = pos;
    if (!this.isInBounds(row, col)) return null;

    const piece = this.grid[row][col];
    if (!piece) return null;

    if (piece === piece.toLowerCase() && piece !== piece.toUpperCase()) return 'b';
    if (piece === piece.toUpperCase() && piece !== piece.toLowerCase()) return 'w';

    return null;
  }
  
  isCheck(color: 'w' | 'b'): boolean {
    let kingFound = false;
    let row = 0;
    let col = 0;

    const enemy = {
      pawn:   color === 'b' ? 'P' : 'p',
      knight: color === 'b' ? 'N' : 'n',
      bishop: color === 'b' ? 'B' : 'b',
      rook:   color === 'b' ? 'R' : 'r',
      queen:  color === 'b' ? 'Q' : 'q',
      king:   color === 'b' ? 'K' : 'k',
    };

    const friend = color === 'w' ? ['P', 'N', 'B', 'R', 'Q'] : ['p', 'n', 'b', 'r', 'q'];

    // King Position
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++ ) {
        if (this.grid[i][j] === (color === 'w' ? 'K' : 'k')) {
          kingFound = true;
          row = i;
          col = j;
          break;
        }
      }
      if (kingFound) break;
    }
    if (!kingFound) {
      console.table(this.grid);
      throw new Error(`King (${color}) not Found in: \n${this.grid}`);
    }

    // King directions are first square of Rook + Bishop
    // Queen is Rook + Bishop

    const rookDirections = [
      [1,  0], // Down
      [-1, 0], // Up
      [0,  1], // Right
      [0, -1], // Left
    ];
    for (const [dRow, dCol] of rookDirections) {
      let i = row + dRow;
      let j = col + dCol;
      let iterations = 0;

      while (this.isInBounds(i, j)) {
        iterations++;
        if (this.grid[i][j] !== null) {
          if (friend.includes(this.grid[i][j]!))                                    break;       // Friendly piece
          if (this.grid[i][j] === enemy.rook || this.grid[i][j] === enemy.queen)    return true; // Enemy rook or queen
          if (iterations === 1 && this.grid[i][j] === enemy.king)                   return true; // Enemy King
          if (!(this.grid[i][j] === enemy.rook || this.grid[i][j] === enemy.queen)) break;       // Enemy Piece blocking attacker
        }

        i += dRow;
        j += dCol;
      }
    }

    const bishopDirections = [
      [1,   1], // Down Right
      [1,  -1], // Down Left
      [-1,  1], // Up Right
      [-1, -1], // Up Left
    ];
    for (const [dRow, dCol] of bishopDirections) {
      let i = row + dRow;
      let j = col + dCol;
      let iterations = 0;

      while (this.isInBounds(i, j)) {
        iterations++;
        if (this.grid[i][j] !== null) {
          if (friend.includes(this.grid[i][j]!))                                      break;       // Friendly piece
          if (this.grid[i][j] === enemy.bishop || this.grid[i][j] === enemy.queen)    return true; // Enemy bishop or queen
          if (iterations === 1 && this.grid[i][j] === enemy.king)                     return true; // Enemy King
          if (!(this.grid[i][j] === enemy.bishop || this.grid[i][j] === enemy.queen)) break;       // Enemy Piece blocking attacker
        }

        i += dRow;
        j += dCol;
      }
    }

    const knightDirections = [
      [row + 2, col + 1], // Down Right
      [row + 2, col - 1], // Down Left

      [row - 2, col + 1], // Up Right
      [row - 2, col - 1], // Up Left

      [row + 1, col + 2], // Right Down
      [row + 1, col - 2], // Left Down

      [row - 1, col + 2], // Right Up
      [row - 1, col - 2], // Left Up
    ];
    for (const [r, c] of knightDirections) {
      if (!this.isInBounds(r ,c))           continue;    // Out of Bounds
      if (this.grid[r][c] === null)         continue;    // Empty Square
      if (this.grid[r][c] === enemy.knight) return true; // Enemy Knight
    }

    // Pawn
    const pawnDirection = color === 'w' ? -1 : 1;
    const pawnRow = row + pawnDirection;
    const pawnCol1 = col - 1;
    const pawnCol2 = col + 1;
    if (this.isInBounds(pawnRow, pawnCol1)) {
      if (this.grid[pawnRow][pawnCol1] === enemy.pawn) return true;
    }
    if (this.isInBounds(pawnRow, pawnCol2)) {
      if (this.grid[pawnRow][pawnCol2] === enemy.pawn) return true;
    }

    return false;
  }

  isSafeMove(move: number[][]): boolean {
    const [[fromRow, fromCol], [toRow, toCol], [metadata]] = move;
    const tempBoard = new Board(this);

    tempBoard.grid[toRow][toCol]     = tempBoard.grid[fromRow][fromCol];
    tempBoard.grid[fromRow][fromCol] = null;

    // En Passant
    if (metadata === 101) tempBoard.grid[fromRow][toCol] = null;

    // Promotion
    if      (metadata === 300) tempBoard.grid[toRow][toCol] = this.turn === 'w' ? 'Q' : 'q';
    else if (metadata === 301) tempBoard.grid[toRow][toCol] = this.turn === 'w' ? 'N' : 'n';
    else if (metadata === 302) tempBoard.grid[toRow][toCol] = this.turn === 'w' ? 'R' : 'r';
    else if (metadata === 303) tempBoard.grid[toRow][toCol] = this.turn === 'w' ? 'B' : 'b';

    // Castle

    return !tempBoard.isCheck(tempBoard.turn);
  }

  isInBounds(i: number, j: number): boolean {
    return (i < 8 && i >= 0 && j < 8 && j >= 0);
  }


  FEN(): string {
    // 1. Piece Placement
    const piecePlacement = this.grid.map(row => {
      let rowString: string = '';
      let emptyCount: number = 0;

      for (const square of row) {
        if (square === null) emptyCount++;
        else {
          if (emptyCount > 0) {
            rowString += String(emptyCount);
            emptyCount = 0;
          }
          rowString += square;
        }
      }

      if (emptyCount > 0) rowString += String(emptyCount); // trailing empty squares
      return rowString;
    }).join('/');

    // 2. Active color
    const activeColor: string = this.fullMoveNumber % 2 === 1 ? 'w' : 'b';

    // 3. Castling rights
    const castlingRights: string[] = [];
    if (this.castlingRights.white.kingSide)  castlingRights.push('K');
    if (this.castlingRights.white.queenSide) castlingRights.push('Q');
    if (this.castlingRights.black.kingSide)  castlingRights.push('k');
    if (this.castlingRights.black.queenSide) castlingRights.push('q');
    const castlingRightsString: string = castlingRights.length > 0 ? castlingRights.join('') : '-';

    // 4. En passant
    let enPassant: string;
    const numRows = ['a', 'b', 'c', 'd', 'e', 'e', 'f', 'g', 'h'];
    if (this.enPassant === null) enPassant = '-';
    else                         enPassant = `${numRows[this.enPassant[0]]}${this.enPassant[1]}`;

    return [
      piecePlacement,
      activeColor,
      castlingRightsString,
      enPassant,
      String(this.halfMoveClock),
      String(this.fullMoveNumber),
    ].join(' ');
  }
}
