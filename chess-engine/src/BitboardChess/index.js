import ChessInterface from "../ChessInterface/index.js";
import { MoveValidationResult } from "../MoveValidationResult/index.js";

// Standard piece codes
const WHITE_PAWN   = 1;
const WHITE_KNIGHT = 2;
const WHITE_BISHOP = 3;
const WHITE_ROOK   = 4;
const WHITE_QUEEN  = 5;
const WHITE_KING   = 6;
const BLACK_PAWN   = 7;
const BLACK_KNIGHT = 8;
const BLACK_BISHOP = 9;
const BLACK_ROOK   = 10;
const BLACK_QUEEN  = 11;
const BLACK_KING   = 12;

// Export piece constants for testing.
export const PIECES = {
  WHITE_PAWN,
  WHITE_KNIGHT,
  WHITE_BISHOP,
  WHITE_ROOK,
  WHITE_QUEEN,
  WHITE_KING,
  BLACK_PAWN,
  BLACK_KNIGHT,
  BLACK_BISHOP,
  BLACK_ROOK,
  BLACK_QUEEN,
  BLACK_KING
};

function bitMask(squares) {
  let mask = 0n;
  for (let sq of squares) {
    mask |= (1n << BigInt(sq));
  }
  return mask;
}

export default class BitboardChess extends ChessInterface {
  constructor() {
    super();
    this.bitboards = {
      whitePawns: 0n,
      whiteKnights: 0n,
      whiteBishops: 0n,
      whiteRooks: 0n,
      whiteQueen: 0n,
      whiteKing: 0n,
      blackPawns: 0n,
      blackKnights: 0n,
      blackBishops: 0n,
      blackRooks: 0n,
      blackQueen: 0n,
      blackKing: 0n
    };
    this.currentTurn = "white";
    // Advanced state
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };
    this.enPassantSquare = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.initializeBoard();
  }

  // --- Basic Methods Implementation ---
  initializeBoard() {
    this.bitboards.whiteRooks   = bitMask([0, 7]);
    this.bitboards.whiteKnights = bitMask([1, 6]);
    this.bitboards.whiteBishops = bitMask([2, 5]);
    this.bitboards.whiteQueen   = bitMask([3]);
    this.bitboards.whiteKing    = bitMask([4]);
    this.bitboards.whitePawns   = bitMask([8, 9, 10, 11, 12, 13, 14, 15]);
    this.bitboards.blackPawns   = bitMask([48, 49, 50, 51, 52, 53, 54, 55]);
    this.bitboards.blackRooks   = bitMask([56, 63]);
    this.bitboards.blackKnights = bitMask([57, 62]);
    this.bitboards.blackBishops = bitMask([58, 61]);
    this.bitboards.blackQueen   = bitMask([59]);
    this.bitboards.blackKing    = bitMask([60]);
  }
  
  loadGame(state) {
    // Assume state is a 64-element array.
    for (let i = 0; i < 64; i++) {
      this.setPieceAt(i, state[i]);
    }
  }
  
  getGameState() {
    const arr = [];
    for (let i = 0; i < 64; i++) {
      arr.push(this.getPieceAt(i));
    }
    return arr;
  }
  
  getPieceAt(index) {
    const bit = 1n << BigInt(index);
    if (this.bitboards.whitePawns & bit) return WHITE_PAWN;
    if (this.bitboards.whiteKnights & bit) return WHITE_KNIGHT;
    if (this.bitboards.whiteBishops & bit) return WHITE_BISHOP;
    if (this.bitboards.whiteRooks & bit) return WHITE_ROOK;
    if (this.bitboards.whiteQueen & bit) return WHITE_QUEEN;
    if (this.bitboards.whiteKing & bit) return WHITE_KING;
    if (this.bitboards.blackPawns & bit) return BLACK_PAWN;
    if (this.bitboards.blackKnights & bit) return BLACK_KNIGHT;
    if (this.bitboards.blackBishops & bit) return BLACK_BISHOP;
    if (this.bitboards.blackRooks & bit) return BLACK_ROOK;
    if (this.bitboards.blackQueen & bit) return BLACK_QUEEN;
    if (this.bitboards.blackKing & bit) return BLACK_KING;
    return 0;
  }
  
  setPieceAt(index, piece) {
    this.removePieceAt(index);
    if (piece !== 0) {
      this.updatePiece(piece, index);
    }
  }
  
  removePieceAt(index) {
    const bit = 1n << BigInt(index);
    this.bitboards.whitePawns   &= ~bit;
    this.bitboards.whiteKnights &= ~bit;
    this.bitboards.whiteBishops &= ~bit;
    this.bitboards.whiteRooks   &= ~bit;
    this.bitboards.whiteQueen   &= ~bit;
    this.bitboards.whiteKing    &= ~bit;
    this.bitboards.blackPawns   &= ~bit;
    this.bitboards.blackKnights &= ~bit;
    this.bitboards.blackBishops &= ~bit;
    this.bitboards.blackRooks   &= ~bit;
    this.bitboards.blackQueen   &= ~bit;
    this.bitboards.blackKing    &= ~bit;
  }
  
  updatePiece(piece, index) {
    const bit = 1n << BigInt(index);
    switch (piece) {
      case WHITE_PAWN:
        this.bitboards.whitePawns |= bit;
        break;
      case WHITE_KNIGHT:
        this.bitboards.whiteKnights |= bit;
        break;
      case WHITE_BISHOP:
        this.bitboards.whiteBishops |= bit;
        break;
      case WHITE_ROOK:
        this.bitboards.whiteRooks |= bit;
        break;
      case WHITE_QUEEN:
        this.bitboards.whiteQueen |= bit;
        break;
      case WHITE_KING:
        this.bitboards.whiteKing |= bit;
        break;
      case BLACK_PAWN:
        this.bitboards.blackPawns |= bit;
        break;
      case BLACK_KNIGHT:
        this.bitboards.blackKnights |= bit;
        break;
      case BLACK_BISHOP:
        this.bitboards.blackBishops |= bit;
        break;
      case BLACK_ROOK:
        this.bitboards.blackRooks |= bit;
        break;
      case BLACK_QUEEN:
        this.bitboards.blackQueen |= bit;
        break;
      case BLACK_KING:
        this.bitboards.blackKing |= bit;
        break;
      default:
        break;
    }
  }
  
  indexToCoord(index) {
    return { row: Math.floor(index / 8), col: index % 8 };
  }
  
  coordToIndex({ row, col }) {
    return row * 8 + col;
  }
  
  // --- Basic Move Validation and Execution ---
  validateMove(move) {
    let errors = 0;
    const { from, to } = move;
    if (from < 0 || from >= 64) {
      errors |= MoveValidationResult.OUT_OF_BOUNDS | MoveValidationResult.NO_PIECE_AT_SOURCE;
      return errors;
    }
    const piece = this.getPieceAt(from);
    if (piece === 0) {
      errors |= MoveValidationResult.NO_PIECE_AT_SOURCE;
      return errors;
    }
    if (to < 0 || to >= 64) {
      errors |= MoveValidationResult.OUT_OF_BOUNDS;
      return errors;
    }
    const pieceColor = piece <= 6 ? "white" : "black";
    if (pieceColor !== this.currentTurn) {
      errors |= MoveValidationResult.WRONG_TURN;
    }
    if (piece !== PIECES.WHITE_KNIGHT && piece !== PIECES.BLACK_KNIGHT) {
      const dest = this.getPieceAt(to);
      if (dest !== 0) {
        const destColor = dest <= 6 ? "white" : "black";
        if (destColor === pieceColor) {
          errors |= MoveValidationResult.DESTINATION_OCCUPIED_BY_FRIENDLY;
        }
      }
    }
    const fromCoord = this.indexToCoord(from);
    const toCoord = this.indexToCoord(to);
    let movementError;
    if ((piece === PIECES.WHITE_BISHOP || piece === PIECES.BLACK_BISHOP) &&
        (Math.abs(toCoord.row - fromCoord.row) !== Math.abs(toCoord.col - fromCoord.col))) {
      movementError = MoveValidationResult.ILLEGAL_BISHOP_MOVE;
    } else {
      switch (piece) {
        case PIECES.WHITE_PAWN:
        case PIECES.BLACK_PAWN:
          movementError = this.validatePawnMove(fromCoord, toCoord, piece);
          break;
        case PIECES.WHITE_KNIGHT:
        case PIECES.BLACK_KNIGHT:
          movementError = this.validateKnightMove(fromCoord, toCoord);
          break;
        case PIECES.WHITE_BISHOP:
        case PIECES.BLACK_BISHOP:
          movementError = this.validateBishopMove(fromCoord, toCoord);
          break;
        case PIECES.WHITE_ROOK:
        case PIECES.BLACK_ROOK:
          movementError = this.validateRookMove(fromCoord, toCoord);
          break;
        case PIECES.WHITE_QUEEN:
        case PIECES.BLACK_QUEEN:
          if (this.getPieceAt(to) !== 0) {
            const destColor = this.getPieceAt(to) <= 6 ? "white" : "black";
            if (destColor === pieceColor) {
              errors &= ~MoveValidationResult.DESTINATION_OCCUPIED_BY_FRIENDLY;
              movementError = MoveValidationResult.ILLEGAL_QUEEN_MOVE;
              break;
            }
          }
          movementError = this.validateQueenMove(fromCoord, toCoord);
          break;
        case PIECES.WHITE_KING:
        case PIECES.BLACK_KING:
          movementError = this.validateKingMove(fromCoord, toCoord);
          break;
        default:
          movementError = MoveValidationResult.ILLEGAL_KING_MOVE;
      }
    }
    if (piece !== PIECES.WHITE_PAWN && piece !== PIECES.BLACK_PAWN &&
        piece !== PIECES.WHITE_KNIGHT && piece !== PIECES.BLACK_KNIGHT &&
        movementError !== MoveValidationResult.VALID) {
      errors &= ~MoveValidationResult.DESTINATION_OCCUPIED_BY_FRIENDLY;
    }
    return errors | movementError;
  }
  
  movePiece(move) {
    const validationCode = this.validateMove(move);
    if (validationCode !== MoveValidationResult.VALID) {
      throw new Error("Invalid move: " + validationCode);
    }
    const { from, to } = move;
    const piece = this.getPieceAt(from);
    this.removePieceAt(from);
    if (this.getPieceAt(to) !== 0) {
      this.removePieceAt(to);
    }
    this.updatePiece(piece, to);
    this.currentTurn = this.currentTurn === "white" ? "black" : "white";
  }
  
  // _movePieceNoValidation bypasses validation; used by castling.
  _movePieceNoValidation(move) {
    const { from, to } = move;
    const piece = this.getPieceAt(from);
    this.removePieceAt(from);
    if (this.getPieceAt(to) !== 0) {
      this.removePieceAt(to);
    }
    this.updatePiece(piece, to);
  }
  
  // --- Pawn Validation ---
  validatePawnMove(from, to, piece) {
    const direction = piece === PIECES.WHITE_PAWN ? 1 : -1;
    const startRow = piece === PIECES.WHITE_PAWN ? 1 : 6;
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    if (colDiff === 0) {
      if (rowDiff === direction && this.getPieceAt(this.coordToIndex(to)) === 0) {
        return MoveValidationResult.VALID;
      }
      if (from.row === startRow && rowDiff === 2 * direction) {
        const intermediate = this.coordToIndex({ row: from.row + direction, col: from.col });
        if (this.getPieceAt(intermediate) === 0 && this.getPieceAt(this.coordToIndex(to)) === 0) {
          return MoveValidationResult.VALID;
        }
      }
      return MoveValidationResult.ILLEGAL_PAWN_MOVE;
    }
    if (Math.abs(colDiff) === 1 && rowDiff === direction) {
      const dest = this.getPieceAt(this.coordToIndex(to));
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
  
  // --- Knight Validation ---
  validateKnightMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    return ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))
      ? MoveValidationResult.VALID
      : MoveValidationResult.ILLEGAL_KNIGHT_MOVE;
  }
  
  // --- Sliding Piece Validation ---
  isPathClearCoords(from, to) {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const stepCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    let current = { row: from.row + stepRow, col: from.col + stepCol };
    while (current.row !== to.row || current.col !== to.col) {
      if (this.getPieceAt(this.coordToIndex(current)) !== 0) return false;
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
  
  // --- Advanced Methods Implementation ---
  isKingInCheck(color) {
    const board = this.getGameState();
    const kingCode = color === "white" ? PIECES.WHITE_KING : PIECES.BLACK_KING;
    const kingIndex = board.findIndex(piece => piece === kingCode);
    if (kingIndex === -1) return false;
    const enemyColor = color === "white" ? "black" : "white";
    for (let i = 0; i < 64; i++) {
      const piece = board[i];
      if (piece !== 0) {
        const pieceColor = piece <= 6 ? "white" : "black";
        if (pieceColor === enemyColor) {
          const savedTurn = this.currentTurn;
          this.currentTurn = enemyColor;
          if (this.validateMove({ from: i, to: kingIndex }) === 0) {
            this.currentTurn = savedTurn;
            return true;
          }
          this.currentTurn = savedTurn;
        }
      }
    }
    return false;
  }
  
  getLegalMoves(color) {
    const moves = [];
    const board = this.getGameState();
    for (let i = 0; i < 64; i++) {
      if (board[i] !== 0) {
        const pieceColor = board[i] <= 6 ? "white" : "black";
        if (pieceColor === color) {
          for (let j = 0; j < 64; j++) {
            const move = { from: i, to: j };
            if (this.validateMove(move) === 0) {
              const savedState = this.getGameState();
              const savedTurn = this.currentTurn;
              try {
                this.movePiece(move);
                if (!this.isKingInCheck(color)) {
                  moves.push(move);
                }
              } catch (e) { }
              this.loadGame(savedState);
              this.currentTurn = savedTurn;
            }
          }
        }
      }
    }
    return moves;
  }
  
  isCheckmate(color) {
    if (!this.isKingInCheck(color)) return false;
    return this.getLegalMoves(color).length === 0;
  }
  
  isStalemate(color) {
    if (this.isKingInCheck(color)) return false;
    return this.getLegalMoves(color).length === 0;
  }
  
  canCastle(color, side) {
    if (!this.castlingRights[color][side]) return false;
    let kingStart, rookStart, between;
    if (color === "white") {
      kingStart = 4;
      if (side === "kingside") {
        rookStart = 7;
        between = [5, 6];
      } else {
        rookStart = 0;
        between = [1, 2, 3];
      }
    } else {
      kingStart = 60;
      if (side === "kingside") {
        rookStart = 63;
        between = [61, 62];
      } else {
        rookStart = 56;
        between = [57, 58, 59];
      }
    }
    const state = this.getGameState();
    for (let sq of between) {
      if (state[sq] !== 0) return false;
    }
    if (this.isKingInCheck(color)) return false;
    for (let sq of [kingStart, kingStart + (side === "kingside" ? 1 : -1)]) {
      for (let i = 0; i < 64; i++) {
        const enemyPiece = state[i];
        if (enemyPiece !== 0) {
          const enemyColor = enemyPiece <= 6 ? "white" : "black";
          if (enemyColor !== color) {
            const savedTurn = this.currentTurn;
            this.currentTurn = enemyColor;
            if (this.validateMove({ from: i, to: sq }) === 0) {
              this.currentTurn = savedTurn;
              return false;
            }
            this.currentTurn = savedTurn;
          }
        }
      }
    }
    return true;
  }
  
  performCastling(color, side) {
    if (!this.canCastle(color, side)) throw new Error("Castling not allowed");
    let kingFrom, kingTo, rookFrom, rookTo;
    if (color === "white") {
      kingFrom = 4;
      if (side === "kingside") {
        kingTo = 6;
        rookFrom = 7;
        rookTo = 5;
      } else {
        kingTo = 2;
        rookFrom = 0;
        rookTo = 3;
      }
    } else {
      kingFrom = 60;
      if (side === "kingside") {
        kingTo = 62;
        rookFrom = 63;
        rookTo = 61;
      } else {
        kingTo = 58;
        rookFrom = 56;
        rookTo = 59;
      }
    }
    this._movePieceNoValidation({ from: kingFrom, to: kingTo });
    this._movePieceNoValidation({ from: rookFrom, to: rookTo });
    this.castlingRights[color].kingside = false;
    this.castlingRights[color].queenside = false;
    this.currentTurn = this.currentTurn === "white" ? "black" : "white";
    return true;
  }
  
  _movePieceNoValidation(move) {
    const { from, to } = move;
    const piece = this.getPieceAt(from);
    this.removePieceAt(from);
    if (this.getPieceAt(to) !== 0) {
      this.removePieceAt(to);
    }
    this.updatePiece(piece, to);
  }
  
  validateEnPassant(move) {
    if (this.enPassantSquare !== null && move.to === this.enPassantSquare) {
      return 0;
    }
    return MoveValidationResult.ILLEGAL_PAWN_MOVE;
  }
  
  performPromotion(move, promotionPiece) {
    const toCoord = this.indexToCoord(move.to);
    const pawn = this.getPieceAt(move.from);
    if ((pawn === PIECES.WHITE_PAWN && toCoord.row !== 7) ||
        (pawn === PIECES.BLACK_PAWN && toCoord.row !== 0)) {
      throw new Error("Pawn has not reached promotion rank");
    }
    this.movePiece(move);
    this.setPieceAt(move.to, promotionPiece);
  }
  
  parseFEN(fen) {
    const parts = fen.split(" ");
    if (parts.length < 4) throw new Error("Invalid FEN");
    const boardPart = parts[0];
    const rows = boardPart.split("/");
    if (rows.length !== 8) throw new Error("Invalid FEN board layout");
    for (let i = 0; i < 64; i++) this.setPieceAt(i, 0);
    const fenMap = {
      'P': PIECES.WHITE_PAWN,
      'N': PIECES.WHITE_KNIGHT,
      'B': PIECES.WHITE_BISHOP,
      'R': PIECES.WHITE_ROOK,
      'Q': PIECES.WHITE_QUEEN,
      'K': PIECES.WHITE_KING,
      'p': PIECES.BLACK_PAWN,
      'n': PIECES.BLACK_KNIGHT,
      'b': PIECES.BLACK_BISHOP,
      'r': PIECES.BLACK_ROOK,
      'q': PIECES.BLACK_QUEEN,
      'k': PIECES.BLACK_KING
    };
    let index = 0;
    for (let row of rows) {
      for (let char of row) {
        if (!isNaN(char)) {
          index += parseInt(char, 10);
        } else if (fenMap[char]) {
          this.setPieceAt(index, fenMap[char]);
          index++;
        }
      }
    }
    this.currentTurn = parts[1] === "w" ? "white" : "black";
    const castling = parts[2];
    this.castlingRights.white.kingside = castling.includes("K");
    this.castlingRights.white.queenside = castling.includes("Q");
    this.castlingRights.black.kingside = castling.includes("k");
    this.castlingRights.black.queenside = castling.includes("q");
    this.enPassantSquare = parts[3] === "-" ? null : this.algebraicToIndex(parts[3]);
    this.halfmoveClock = parts[4] ? parseInt(parts[4], 10) : 0;
    this.fullmoveNumber = parts[5] ? parseInt(parts[5], 10) : 1;
  }
  
  exportFEN() {
    let fen = "";
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const index = r * 8 + c;
        const piece = this.getPieceAt(index);
        if (piece === 0) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += this.pieceToFEN(piece);
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += "/";
    }
    const active = this.currentTurn === "white" ? "w" : "b";
    let castling = "";
    if (this.castlingRights.white.kingside) castling += "K";
    if (this.castlingRights.white.queenside) castling += "Q";
    if (this.castlingRights.black.kingside) castling += "k";
    if (this.castlingRights.black.queenside) castling += "q";
    if (castling === "") castling = "-";
    const enPassant = this.enPassantSquare === null ? "-" : this.indexToAlgebraic(this.enPassantSquare);
    fen += ` ${active} ${castling} ${enPassant} ${this.halfmoveClock} ${this.fullmoveNumber}`;
    return fen;
  }
  
  pieceToFEN(piece) {
    const map = {
      [PIECES.WHITE_PAWN]: "P",
      [PIECES.WHITE_KNIGHT]: "N",
      [PIECES.WHITE_BISHOP]: "B",
      [PIECES.WHITE_ROOK]: "R",
      [PIECES.WHITE_QUEEN]: "Q",
      [PIECES.WHITE_KING]: "K",
      [PIECES.BLACK_PAWN]: "p",
      [PIECES.BLACK_KNIGHT]: "n",
      [PIECES.BLACK_BISHOP]: "b",
      [PIECES.BLACK_ROOK]: "r",
      [PIECES.BLACK_QUEEN]: "q",
      [PIECES.BLACK_KING]: "k"
    };
    return map[piece] || "";
  }
  
  algebraicToIndex(an) {
    const file = an[0];
    const rank = parseInt(an[1], 10);
    const col = file.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - rank;
    return row * 8 + col;
  }
  
  indexToAlgebraic(index) {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const file = String.fromCharCode("a".charCodeAt(0) + col);
    const rank = 8 - row;
    return `${file}${rank}`;
  }
  
  parsePGN(pgn) {
    const tokens = pgn.split(/\s+/).filter(t => !/^\d+\.$/.test(t) && t !== "");
    return tokens;
  }
  
  exportPGN(moves) {
    return moves.join(" ");
  }
  
  // For use by getLegalMoves.
  loadGame(state) {
    // Assume state is a 64-element array.
    for (let i = 0; i < 64; i++) {
      this.setPieceAt(i, state[i]);
    }
  }
}
