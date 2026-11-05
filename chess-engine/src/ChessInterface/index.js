/**
 * ChessInterface is an abstract base class that defines the core API for a chess engine.
 * It includes basic methods (initializeBoard, loadGame, getGameState, validateMove, movePiece)
 * as well as advanced rule–enforcement methods (check detection, checkmate/stalemate,
 * castling, en passant, promotion, FEN/PGN support).
 *
 * Subclasses must implement all of these methods.
 */
export default class ChessInterface {
  constructor() {
    if (new.target === ChessInterface) {
      throw new Error("Cannot instantiate abstract class ChessInterface directly");
    }
  }

  // --- Basic Methods ---
  initializeBoard() {
    throw new Error("initializeBoard() not implemented");
  }
  
  loadGame(state) {
    throw new Error("loadGame() not implemented");
  }
  
  getGameState() {
    throw new Error("getGameState() not implemented");
  }
  
  validateMove(move) {
    throw new Error("validateMove() not implemented");
  }
  
  movePiece(move) {
    throw new Error("movePiece() not implemented");
  }
  
  // --- Advanced Methods ---
  isKingInCheck(color) {
    throw new Error("isKingInCheck() not implemented");
  }
  
  getLegalMoves(color) {
    throw new Error("getLegalMoves() not implemented");
  }
  
  isCheckmate(color) {
    throw new Error("isCheckmate() not implemented");
  }
  
  isStalemate(color) {
    throw new Error("isStalemate() not implemented");
  }
  
  canCastle(color, side) {
    throw new Error("canCastle() not implemented");
  }
  
  performCastling(color, side) {
    throw new Error("performCastling() not implemented");
  }
  
  validateEnPassant(move) {
    throw new Error("validateEnPassant() not implemented");
  }
  
  performPromotion(move, promotionPiece) {
    throw new Error("performPromotion() not implemented");
  }
  
  parseFEN(fen) {
    throw new Error("parseFEN() not implemented");
  }
  
  exportFEN() {
    throw new Error("exportFEN() not implemented");
  }
  
  parsePGN(pgn) {
    throw new Error("parsePGN() not implemented");
  }
  
  exportPGN(moves) {
    throw new Error("exportPGN() not implemented");
  }
}
