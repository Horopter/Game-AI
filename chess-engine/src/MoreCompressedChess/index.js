import ChessInterface from "../ChessInterface/index.js";
import { MoveValidationResult } from "../MoveValidationResult/index.js";

/**
 * MoreCompressedChess is a sibling implementation that uses a FEN-like string
 * for board initialization and the same bit-flag error validation as NaiveChess.
 */
export default class MoreCompressedChess extends ChessInterface {
  /**
   * Constructs a MoreCompressedChess instance.
   * @param {string} fen - A FEN string. Defaults to the standard starting position.
   */
  constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR") {
    super();
    this.loadFEN(fen);
    this.currentTurn = "white";
  }

  loadGame(state) {
    // Simply assign the state to this.board.
    this.board = state;
  }
  
  getGameState() {
    return this.board;
  }

  /**
   * Loads a FEN string and converts it into an 8×8 board.
   * @param {string} fen 
   */
  loadFEN(fen) {
    const rows = fen.split("/");
    if (rows.length !== 8) {
      throw new Error("Invalid FEN: must have 8 rows");
    }
    const board = [];
    const pieceMap = {
      p: { type: "pawn", color: "black" },
      r: { type: "rook", color: "black" },
      n: { type: "knight", color: "black" },
      b: { type: "bishop", color: "black" },
      q: { type: "queen", color: "black" },
      k: { type: "king", color: "black" },
      P: { type: "pawn", color: "white" },
      R: { type: "rook", color: "white" },
      N: { type: "knight", color: "white" },
      B: { type: "bishop", color: "white" },
      Q: { type: "queen", color: "white" },
      K: { type: "king", color: "white" }
    };

    for (let row of rows) {
      const boardRow = [];
      for (let char of row) {
        if (/\d/.test(char)) {
          const count = parseInt(char, 10);
          for (let i = 0; i < count; i++) {
            boardRow.push(null);
          }
        } else if (pieceMap[char]) {
          // Clone the object.
          boardRow.push({ ...pieceMap[char] });
        } else {
          throw new Error("Invalid FEN character: " + char);
        }
      }
      if (boardRow.length !== 8) {
        throw new Error("Invalid FEN row length");
      }
      board.push(boardRow);
    }
    this.board = board;
  }

  getGameState() {
    return this.board;
  }

  isPathClear(from, to) {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const stepCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    let currentRow = from.row + stepRow;
    let currentCol = from.col + stepCol;
    while (currentRow !== to.row || currentCol !== to.col) {
      if (this.board[currentRow][currentCol] !== null) return false;
      currentRow += stepRow;
      currentCol += stepCol;
    }
    return true;
  }

  validateMove(move) {
    let errors = 0;
    const { from, to } = move;
    const sourceInBounds =
      from.row >= 0 && from.row < 8 && from.col >= 0 && from.col < 8;
    const destInBounds =
      to.row >= 0 && to.row < 8 && to.col >= 0 && to.col < 8;

    // 1. Check source bounds.
    if (!sourceInBounds) {
      return MoveValidationResult.OUT_OF_BOUNDS | MoveValidationResult.NO_PIECE_AT_SOURCE;
    }

    // 2. If source is empty, return NO_PIECE_AT_SOURCE.
    const piece = this.board[from.row][from.col];
    if (!piece) {
      return MoveValidationResult.NO_PIECE_AT_SOURCE;
    }

    // 3. Check destination bounds.
    if (!destInBounds) {
      return MoveValidationResult.OUT_OF_BOUNDS;
    }

    // 4. Check turn.
    const correctTurn = piece.color === this.currentTurn;
    if (!correctTurn) {
      errors |= MoveValidationResult.WRONG_TURN;
    } else {
      // 5. Check destination occupancy.
      const destination = this.board[to.row][to.col];
      if (destination && destination.color === piece.color) {
        errors |= MoveValidationResult.DESTINATION_OCCUPIED_BY_FRIENDLY;
      }
    }

    // 6. Run piece-specific validations.
    switch (piece.type) {
      case "pawn":
        errors |= this.validatePawnMove(from, to, piece);
        break;
      case "knight":
        errors |= this.validateKnightMove(from, to, piece);
        break;
      case "bishop":
        errors |= this.validateBishopMove(from, to, piece);
        break;
      case "rook":
        errors |= this.validateRookMove(from, to, piece);
        break;
      case "queen":
        errors |= this.validateQueenMove(from, to, piece);
        break;
      case "king":
        errors |= this.validateKingMove(from, to, piece);
        break;
      default:
        errors |= MoveValidationResult.ILLEGAL_KING_MOVE;
    }
    return errors;
  }

  validatePawnMove(from, to, piece) {
    let errors = 0;
    const direction = piece.color === "white" ? -1 : 1;
    const startRow = piece.color === "white" ? 6 : 1;
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    if (colDiff === 0) {
      if (rowDiff === direction && this.board[to.row][to.col] === null) {
        return errors;
      }
      if (
        from.row === startRow &&
        rowDiff === 2 * direction &&
        this.board[from.row + direction][from.col] === null &&
        this.board[to.row][to.col] === null
      ) {
        return errors;
      }
      errors |= MoveValidationResult.ILLEGAL_PAWN_MOVE;
    } else if (Math.abs(colDiff) === 1 && rowDiff === direction) {
      if (this.board[to.row][to.col] && this.board[to.row][to.col].color !== piece.color) {
        return errors;
      }
      errors |= MoveValidationResult.ILLEGAL_PAWN_MOVE;
    } else {
      errors |= MoveValidationResult.ILLEGAL_PAWN_MOVE;
    }
    return errors;
  }

  validateKnightMove(from, to, piece) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    return ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))
      ? 0
      : MoveValidationResult.ILLEGAL_KNIGHT_MOVE;
  }

  validateBishopMove(from, to, piece) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    if (rowDiff !== colDiff) return MoveValidationResult.ILLEGAL_BISHOP_MOVE;
    if (!this.isPathClear(from, to)) return MoveValidationResult.PATH_NOT_CLEAR;
    return 0;
  }

  validateRookMove(from, to, piece) {
    if (from.row !== to.row && from.col !== to.col)
      return MoveValidationResult.ILLEGAL_ROOK_MOVE;
    if (!this.isPathClear(from, to)) return MoveValidationResult.PATH_NOT_CLEAR;
    return 0;
  }

  validateQueenMove(from, to, piece) {
    const bishopErr = this.validateBishopMove(from, to, piece);
    const rookErr = this.validateRookMove(from, to, piece);
    if (bishopErr === 0 || rookErr === 0) return 0;
    if (bishopErr & MoveValidationResult.PATH_NOT_CLEAR || rookErr & MoveValidationResult.PATH_NOT_CLEAR) {
      return MoveValidationResult.PATH_NOT_CLEAR;
    }
    return MoveValidationResult.ILLEGAL_QUEEN_MOVE;
  }

  validateKingMove(from, to, piece) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    return (rowDiff <= 1 && colDiff <= 1)
      ? 0
      : MoveValidationResult.ILLEGAL_KING_MOVE;
  }

  movePiece(move) {
    const validationCode = this.validateMove(move);
    if (validationCode !== MoveValidationResult.VALID) {
      throw new Error("Invalid move: " + validationCode);
    }
    const { from, to } = move;
    this.board[to.row][to.col] = this.board[from.row][from.col];
    this.board[from.row][from.col] = null;
    this.currentTurn = this.currentTurn === "white" ? "black" : "white";
  }
}
