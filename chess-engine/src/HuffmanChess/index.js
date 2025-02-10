import ChessInterface from "../ChessInterface/index.js";
import { MoveValidationResult } from "../MoveValidationResult/index.js";

const codeMap = {
  0: "00",
  1: "010",
  7: "011",
  2: "1000",
  3: "1001",
  8: "1010",
  9: "1011",
  4: "11000",
  5: "11001",
  6: "11010",
  10: "11011",
  11: "11100",
  12: "11101"
};
const reverseCodeMap = {};
for (let key in codeMap) {
  reverseCodeMap[codeMap[key]] = parseInt(key, 10);
}

// Helpers to convert a bit string to/from Uint8Array.
function bitStringToUint8Array(bitString) {
  const numBytes = Math.ceil(bitString.length / 8);
  const bytes = new Uint8Array(numBytes);
  for (let i = 0; i < numBytes; i++) {
    let byteStr = bitString.substr(i * 8, 8);
    bytes[i] = parseInt(byteStr.padEnd(8, "0"), 2);
  }
  return bytes;
}

function uint8ArrayToBitString(bytes) {
  let bitString = "";
  for (let byte of bytes) {
    bitString += byte.toString(2).padStart(8, "0");
  }
  return bitString;
}

// Base64 conversion helpers.
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

/**
 * HuffmanChess implements a chess engine with board state stored as an array
 * of 64 numbers (one per square) using the standard mapping:
 *   White: Pawn=1, Knight=2, Bishop=3, Rook=4, Queen=5, King=6.
 *   Black: Pawn=7, Knight=8, Bishop=9, Rook=10, Queen=11, King=12.
 * 
 * The board can be compressed into a Base64 string using canonical Huffman coding.
 */
export default class HuffmanChess extends ChessInterface {
  constructor() {
    super();
    // Internal board: plain array of 64 numbers.
    this.board = new Array(64).fill(0);
    this.currentTurn = "white";
    this.initializeBoard();
  }

  initializeBoard() {
    // Black back rank (row 0)
    const blackBackRank = [10, 8, 9, 11, 12, 9, 8, 10];
    for (let i = 0; i < 8; i++) {
      this.board[i] = blackBackRank[i];
    }
    // Black pawns (row 1)
    for (let i = 8; i < 16; i++) {
      this.board[i] = 7;
    }
    // Rows 2-5 remain 0.
    // White pawns (row 6)
    for (let i = 48; i < 56; i++) {
      this.board[i] = 1;
    }
    // White back rank (row 7)
    const whiteBackRank = [4, 2, 3, 5, 6, 3, 2, 4];
    for (let i = 56; i < 64; i++) {
      this.board[i] = whiteBackRank[i - 56];
    }
  }

  getGameState() {
    return this.board.slice();
  }

  /**
   * Returns a compressed Base64 string representing the board.
   */
  getCompressedState() {
    let bitString = "";
    for (let i = 0; i < 64; i++) {
      const piece = this.board[i];
      if (!(piece in codeMap)) {
        throw new Error(`Unknown piece value: ${piece}`);
      }
      bitString += codeMap[piece];
    }
    // Pad to a multiple of 8 bits.
    const padLength = (8 - (bitString.length % 8)) % 8;
    bitString += "0".repeat(padLength);
    const bytes = bitStringToUint8Array(bitString);
    return uint8ArrayToBase64(bytes);
  }

  /**
   * Loads a compressed board state from a Base64 string.
   */
  loadCompressedState(base64Str) {
    const bytes = base64ToUint8Array(base64Str);
    const bitString = uint8ArrayToBitString(bytes);
    const boardArray = [];
    let i = 0;
    while (i < bitString.length && boardArray.length < 64) {
      let found = false;
      // Because our codes range in length from 2 to 5 bits, try lengths 2..5.
      for (let len = 2; len <= 5; len++) {
        const candidate = bitString.substr(i, len);
        if (candidate in reverseCodeMap) {
          boardArray.push(reverseCodeMap[candidate]);
          i += len;
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error("Failed to decode Huffman string at position " + i);
      }
    }
    if (boardArray.length !== 64) {
      throw new Error("Decoded board does not have 64 squares");
    }
    this.board = boardArray;
  }

  // Helpers to convert between index and (row, col)
  indexToCoord(index) {
    return { row: Math.floor(index / 8), col: index % 8 };
  }

  coordToIndex({ row, col }) {
    return row * 8 + col;
  }

  // validateMove uses the following order:
  // (1) Source index in bounds, (2) Source nonempty, (3) Destination in bounds,
  // (4) Turn check, (5) Destination occupancy, (6) Piece-specific validations.
  validateMove(move) {
    let errors = 0;
    const { from, to } = move;
    if (from < 0 || from >= 64) {
      return MoveValidationResult.OUT_OF_BOUNDS | MoveValidationResult.NO_PIECE_AT_SOURCE;
    }
    const piece = this.board[from];
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
      const dest = this.board[to];
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
      if (rowDiff === direction && this.board[this.coordToIndex(to)] === 0) {
        return MoveValidationResult.VALID;
      }
      if (from.row === startRow && rowDiff === 2 * direction) {
        const intermediate = this.coordToIndex({ row: from.row + direction, col: from.col });
        if (this.board[intermediate] === 0 && this.board[this.coordToIndex(to)] === 0) {
          return MoveValidationResult.VALID;
        }
      }
      return MoveValidationResult.ILLEGAL_PAWN_MOVE;
    }
    if (Math.abs(colDiff) === 1 && rowDiff === direction) {
      const dest = this.board[this.coordToIndex(to)];
      if (dest !== 0) {
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
      if (this.board[this.coordToIndex(current)] !== 0) return false;
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
    const piece = this.board[from];
    this.board[from] = 0;
    this.board[to] = piece;
    this.currentTurn = this.currentTurn === "white" ? "black" : "white";
  }
}
