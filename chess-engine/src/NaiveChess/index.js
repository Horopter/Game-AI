import ChessInterface from "../ChessInterface/index.js";
import { MoveValidationResult } from "../MoveValidationResult/index.js";

export default class NaiveChess extends ChessInterface {
  constructor() {
    super();
    this.board = this.initializeBoard();
    this.currentTurn = "white"; // White always starts.
  }

  initializeBoard() {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));
    // Set up pawns.
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: "pawn", color: "black" };
      board[6][i] = { type: "pawn", color: "white" };
    }
    // Set up rooks.
    board[0][0] = board[0][7] = { type: "rook", color: "black" };
    board[7][0] = board[7][7] = { type: "rook", color: "white" };
    // Set up knights.
    board[0][1] = board[0][6] = { type: "knight", color: "black" };
    board[7][1] = board[7][6] = { type: "knight", color: "white" };
    // Set up bishops.
    board[0][2] = board[0][5] = { type: "bishop", color: "black" };
    board[7][2] = board[7][5] = { type: "bishop", color: "white" };
    // Set up queens.
    board[0][3] = { type: "queen", color: "black" };
    board[7][3] = { type: "queen", color: "white" };
    // Set up kings.
    board[0][4] = { type: "king", color: "black" };
    board[7][4] = { type: "king", color: "white" };
    return board;
  }

  loadGame(state) {
    this.board = state;
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

    // 2. If source is empty, return only NO_PIECE_AT_SOURCE.
    const piece = this.board[from.row][from.col];
    if (!piece) {
      return MoveValidationResult.NO_PIECE_AT_SOURCE;
    }

    // 3. Check destination bounds.
    if (!destInBounds) {
      return MoveValidationResult.OUT_OF_BOUNDS;
    }

    // 4. Check turn.
    if (piece.color !== this.currentTurn) {
      errors |= MoveValidationResult.WRONG_TURN;
      // (When turn is wrong, we do NOT check destination occupancy.)
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

  // --- Advanced Methods ---
  isKingInCheck(color) {
    const king = { type: "king", color };
    let kingPos = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === "king" && piece.color === color) {
          kingPos = { row, col };
          break;
        }
      }
      if (kingPos) break;
    }
    if (!kingPos) return false;

    const enemyColor = color === "white" ? "black" : "white";
    const savedTurn = this.currentTurn;
    this.currentTurn = enemyColor;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === enemyColor) {
          const move = { from: { row, col }, to: kingPos };
          if (this.validateMove(move) === MoveValidationResult.VALID) {
            this.currentTurn = savedTurn;
            return true;
          }
        }
      }
    }
    this.currentTurn = savedTurn;
    return false;
  }

  getLegalMoves(color) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === color) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              const move = { from: { row, col }, to: { row: toRow, col: toCol } };
              if (this.validateMove(move) === MoveValidationResult.VALID) {
                const savedState = this.board.map(r => r.map(c => c ? { ...c } : null));
                const savedTurn = this.currentTurn;
                try {
                  this.movePiece(move);
                  if (!this.isKingInCheck(color)) {
                    moves.push(move);
                  }
                } catch (e) {}
                this.board = savedState;
                this.currentTurn = savedTurn;
              }
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
    // Basic implementation - can be enhanced
    return false;
  }

  performCastling(color, side) {
    if (!this.canCastle(color, side)) {
      throw new Error("Castling not allowed");
    }
    // Implementation would go here
  }

  validateEnPassant(move) {
    // Basic stub - en passant requires tracking previous pawn moves
    return MoveValidationResult.ILLEGAL_PAWN_MOVE;
  }

  performPromotion(move, promotionPiece) {
    const validationCode = this.validateMove(move);
    if (validationCode !== MoveValidationResult.VALID) {
      throw new Error("Invalid move: " + validationCode);
    }
    const { from, to } = move;
    const piece = this.board[from.row][from.col];
    if (piece.type !== "pawn") {
      throw new Error("Only pawns can be promoted");
    }
    if ((piece.color === "white" && to.row !== 0) || (piece.color === "black" && to.row !== 7)) {
      throw new Error("Pawn has not reached promotion rank");
    }
    this.board[to.row][to.col] = { type: promotionPiece, color: piece.color };
    this.board[from.row][from.col] = null;
    this.currentTurn = this.currentTurn === "white" ? "black" : "white";
  }

  parseFEN(fen) {
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

  exportFEN() {
    let fen = "";
    for (let row = 0; row < 8; row++) {
      let empty = 0;
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece === null) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          const fenMap = {
            "pawn": piece.color === "white" ? "P" : "p",
            "rook": piece.color === "white" ? "R" : "r",
            "knight": piece.color === "white" ? "N" : "n",
            "bishop": piece.color === "white" ? "B" : "b",
            "queen": piece.color === "white" ? "Q" : "q",
            "king": piece.color === "white" ? "K" : "k"
          };
          fen += fenMap[piece.type];
        }
      }
      if (empty > 0) fen += empty;
      if (row < 7) fen += "/";
    }
    return fen;
  }

  parsePGN(pgn) {
    const tokens = pgn.split(/\s+/).filter(t => !/^\d+\.$/.test(t) && t !== "");
    return tokens;
  }

  exportPGN(moves) {
    return moves.join(" ");
  }
}
