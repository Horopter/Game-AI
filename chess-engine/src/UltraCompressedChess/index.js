import ChessInterface from "../ChessInterface/index.js";
import { MoveValidationResult } from "../MoveValidationResult/index.js";

// Base64 conversion helpers using Node’s Buffer.
function uint8ArrayToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, "binary").toString("base64");
}

function base64ToUint8Array(base64) {
  const binary = Buffer.from(base64, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bigIntToBase64(bigIntVal) {
  let hex = bigIntVal.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return uint8ArrayToBase64(bytes);
}

function base64ToBigInt(base64) {
  const bytes = base64ToUint8Array(base64);
  let hex = "";
  for (const byte of bytes) {
    let h = byte.toString(16);
    if (h.length === 1) h = "0" + h;
    hex += h;
  }
  return BigInt("0x" + hex);
}

/**
 * UltraCompressedChess stores the board as a BigInt using 4 bits per square
 * (64 squares total). The encoding is as follows:
 *   White: Pawn=1, Knight=2, Bishop=3, Rook=4, Queen=5, King=6.
 *   Black: Pawn=7, Knight=8, Bishop=9, Rook=10, Queen=11, King=12.
 */
export default class UltraCompressedChess extends ChessInterface {
  constructor() {
    super();
    this.board = 0n;
    this.currentTurn = "white";
    this.initializeBoard();
  }

  setSquare(index, value) {
    const shift = BigInt(index * 4);
    const mask = 0xFn << shift;
    this.board = (this.board & ~mask) | (BigInt(value & 0xF) << shift);
  }

  getSquare(index) {
    const shift = BigInt(index * 4);
    return Number((this.board >> shift) & 0xFn);
  }

  initializeBoard() {
    this.board = 0n;
    const blackBackRank = [10, 8, 9, 11, 12, 9, 8, 10];
    for (let i = 0; i < 8; i++) {
      this.setSquare(i, blackBackRank[i]);
    }
    for (let i = 8; i < 16; i++) {
      this.setSquare(i, 7);
    }
    // Middle squares remain 0.
    for (let i = 48; i < 56; i++) {
      this.setSquare(i, 1);
    }
    const whiteBackRank = [4, 2, 3, 5, 6, 3, 2, 4];
    for (let i = 56; i < 64; i++) {
      this.setSquare(i, whiteBackRank[i - 56]);
    }
  }

  loadGame(state) {
    if (typeof state === "bigint") {
      this.board = state;
    } else if (typeof state === "string") {
      this.board = base64ToBigInt(state);
    } else {
      throw new Error("Invalid board state");
    }
  }

  getGameState() {
    return this.board;
  }

  getGameStateBase64() {
    return bigIntToBase64(this.board);
  }

  indexToCoord(index) {
    return { row: Math.floor(index / 8), col: index % 8 };
  }

  coordToIndex({ row, col }) {
    return row * 8 + col;
  }

  // validateMove uses the following order:
  // 1. Check source index bounds.
  // 2. Check that source square is nonempty.
  // 3. Check destination index bounds.
  // 4. Check that the piece's color matches current turn.
  // 5. If turn is correct, check destination occupancy.
  // 6. Run piece-specific validations.
  validateMove(move) {
    let errors = 0;
    const { from, to } = move;
    if (from < 0 || from >= 64) {
      return MoveValidationResult.OUT_OF_BOUNDS | MoveValidationResult.NO_PIECE_AT_SOURCE;
    }
    const piece = this.getSquare(from);
    if (piece === 0) {
      return MoveValidationResult.NO_PIECE_AT_SOURCE;
    }
    if (to < 0 || to >= 64) {
      return MoveValidationResult.OUT_OF_BOUNDS;
    }
    const pieceColor = piece <= 6 ? "white" : "black";
    const correctTurn = pieceColor === this.currentTurn;
    if (!correctTurn) {
      errors |= MoveValidationResult.WRONG_TURN;
    } else {
      const dest = this.getSquare(to);
      if (dest !== 0) {
        const destColor = dest <= 6 ? "white" : "black";
        if (destColor === pieceColor) {
          errors |= MoveValidationResult.DESTINATION_OCCUPIED_BY_FRIENDLY;
        }
      }
    }
    const fromCoord = this.indexToCoord(from);
    const toCoord = this.indexToCoord(to);
    switch (piece) {
      case 1: // white pawn
      case 7: // black pawn
        errors |= this.validatePawnMove(fromCoord, toCoord, piece);
        break;
      case 2: // white knight
      case 8: // black knight
        errors |= this.validateKnightMove(fromCoord, toCoord);
        break;
      case 3: // white bishop
      case 9: // black bishop
        errors |= this.validateBishopMove(fromCoord, toCoord);
        break;
      case 4: // white rook
      case 10: // black rook
        errors |= this.validateRookMove(fromCoord, toCoord);
        break;
      case 5: // white queen
      case 11: // black queen
        errors |= this.validateQueenMove(fromCoord, toCoord);
        break;
      case 6: // white king
      case 12: // black king
        errors |= this.validateKingMove(fromCoord, toCoord);
        break;
      default:
        errors |= MoveValidationResult.ILLEGAL_KING_MOVE;
    }
    return errors;
  }

  validatePawnMove(from, to, piece) {
    const direction = piece === 1 ? -1 : 1;
    const startRow = piece === 1 ? 6 : 1;
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    if (colDiff === 0) {
      if (rowDiff === direction && this.getSquare(this.coordToIndex(to)) === 0) {
        return MoveValidationResult.VALID;
      }
      if (from.row === startRow && rowDiff === 2 * direction) {
        const intermediate = this.coordToIndex({ row: from.row + direction, col: from.col });
        if (this.getSquare(intermediate) === 0 && this.getSquare(this.coordToIndex(to)) === 0) {
          return MoveValidationResult.VALID;
        }
      }
      return MoveValidationResult.ILLEGAL_PAWN_MOVE;
    }
    if (Math.abs(colDiff) === 1 && rowDiff === direction) {
      const dest = this.getSquare(this.coordToIndex(to));
      if (dest !== 0) {
        // Check destination piece color.
        const destColor = dest <= 6 ? "white" : "black";
        if (destColor !== (piece <= 6 ? "white" : "black")) {
          return MoveValidationResult.VALID;
        }
      }
      return MoveValidationResult.ILLEGAL_PAWN_MOVE;
    }
    return MoveValidationResult.ILLEGAL_PAWN_MOVE;
  }

  validateKnightMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    return ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))
      ? MoveValidationResult.VALID
      : MoveValidationResult.ILLEGAL_KNIGHT_MOVE;
  }

  isPathClearCoords(from, to) {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const stepCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    let current = { row: from.row + stepRow, col: from.col + stepCol };
    while (current.row !== to.row || current.col !== to.col) {
      if (this.getSquare(this.coordToIndex(current)) !== 0) return false;
      current = { row: current.row + stepRow, col: current.col + stepCol };
    }
    return true;
  }

  validateBishopMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    if (rowDiff !== colDiff) return MoveValidationResult.ILLEGAL_BISHOP_MOVE;
    if (!this.isPathClearCoords(from, to)) return MoveValidationResult.PATH_NOT_CLEAR;
    return MoveValidationResult.VALID;
  }

  validateRookMove(from, to) {
    if (from.row !== to.row && from.col !== to.col)
      return MoveValidationResult.ILLEGAL_ROOK_MOVE;
    if (!this.isPathClearCoords(from, to)) return MoveValidationResult.PATH_NOT_CLEAR;
    return MoveValidationResult.VALID;
  }

  validateQueenMove(from, to) {
    const bishopResult = this.validateBishopMove(from, to);
    const rookResult = this.validateRookMove(from, to);
    if (bishopResult === MoveValidationResult.VALID || rookResult === MoveValidationResult.VALID) {
      return MoveValidationResult.VALID;
    }
    if (bishopResult === MoveValidationResult.PATH_NOT_CLEAR || rookResult === MoveValidationResult.PATH_NOT_CLEAR) {
      return MoveValidationResult.PATH_NOT_CLEAR;
    }
    return MoveValidationResult.ILLEGAL_QUEEN_MOVE;
  }

  validateKingMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    return (rowDiff <= 1 && colDiff <= 1)
      ? MoveValidationResult.VALID
      : MoveValidationResult.ILLEGAL_KING_MOVE;
  }

  movePiece(move) {
    const validationCode = this.validateMove(move);
    if (validationCode !== MoveValidationResult.VALID) {
      throw new Error("Invalid move: " + validationCode);
    }
    const { from, to } = move;
    const piece = this.getSquare(from);
    this.setSquare(from, 0);
    this.setSquare(to, piece);
    this.currentTurn = this.currentTurn === "white" ? "black" : "white";
  }
}
