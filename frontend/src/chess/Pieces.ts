abstract class Piece {
  color: "white" | "black";
  name: 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';

  constructor(color: "white" | "black", name: 'P' | 'N' | 'B' | 'R' | 'Q' | 'K') {
    this.color = color;
    this.name = name;
  }
}

class Pawn extends Piece {
  constructor(color: "white" | "black") {
    super(color, 'P');
  }
}

class Knight extends Piece {
  constructor(color: "white" | "black") {
    super(color, 'N');
  }
}

class Bishop extends Piece {
  constructor(color: "white" | "black") {
    super(color, 'B');
  }
}

class Rook extends Piece {
  constructor(color: "white" | "black") {
    super(color, 'R');
  }
}

class Queen extends Piece {
  constructor(color: "white" | "black") {
    super(color, 'Q');
  }
}

class King extends Piece {
  constructor(color: "white" | "black") {
    super(color, 'K');
  }
}

export {
  Piece,
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King
};
