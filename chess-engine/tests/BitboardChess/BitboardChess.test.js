import BitboardChess, { PIECES } from "../../src/BitboardChess/index.js";
import { MoveValidationResult } from "../../src/MoveValidationResult/index.js";

// Helper assert function.
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected} but got: ${actual}`);
  }
}

// Helper: return board state as an 8×8 array.
BitboardChess.prototype.getGameStateArray = function () {
  const arr = [];
  for (let i = 0; i < 8; i++) {
    const row = [];
    for (let j = 0; j < 8; j++) {
      row.push(this.getPieceAt(i * 8 + j));
    }
    arr.push(row);
  }
  return arr;
};

function newBoard() {
  const b = new BitboardChess();
  b.currentTurn = "white";
  return b;
}

// Custom test runner that collects all failures.
function runTest(testNumber, description, testFn) {
  try {
    testFn();
    console.log(`Test ${testNumber} passed: ${description}`);
    return null;
  } catch (e) {
    return `Test ${testNumber} failed: ${description}\n  ${e.message}`;
  }
}

function runTests() {
  const failures = [];
  let board, move, result;
  
  // --- Basic Move Validation Tests (1–24) ---
  let error;
  
  error = runTest(1, "Out-of-bounds source", () => {
    board = newBoard();
    move = { from: -1, to: 0 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from] || "N/A";
    let destValue = stateAfter[move.to] || "N/A";
    console.log(`Test 1 board state:`, stateAfter);
    console.log(`Test 1 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, (MoveValidationResult.OUT_OF_BOUNDS | MoveValidationResult.NO_PIECE_AT_SOURCE), "Out-of-bounds source");
  });
  if (error) failures.push(error);
  
  error = runTest(2, "Out-of-bounds destination", () => {
    board = newBoard();
    move = { from: 8, to: 64 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to] || "N/A";
    console.log(`Test 2 board state:`, stateAfter);
    console.log(`Test 2 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, MoveValidationResult.OUT_OF_BOUNDS, "Out-of-bounds destination");
  });
  if (error) failures.push(error);
  
  error = runTest(3, "Empty source", () => {
    board = newBoard();
    move = { from: 20, to: 10 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 3 board state:`, stateAfter);
    console.log(`Test 3 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, MoveValidationResult.NO_PIECE_AT_SOURCE, "Empty source");
  });
  if (error) failures.push(error);
  
  error = runTest(4, "Wrong turn", () => {
    board = newBoard();
    board.currentTurn = "black";
    move = { from: 8, to: 16 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 4 board state:`, stateAfter);
    console.log(`Test 4 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 4, "Wrong turn");
  });
  if (error) failures.push(error);
  
  error = runTest(5, "Destination friendly", () => {
    board = newBoard();
    board.setPieceAt(16, PIECES.WHITE_PAWN);
    move = { from: 8, to: 16 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 5 board state:`, stateAfter);
    console.log(`Test 5 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 24, "Destination friendly");
  });
  if (error) failures.push(error);
  
  error = runTest(6, "Pawn single step should be valid", () => {
    board = newBoard();
    move = { from: 8, to: 16 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 6 board state:`, stateAfter);
    console.log(`Test 6 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 0, "Pawn single step valid");
  });
  if (error) failures.push(error);
  
  error = runTest(7, "Pawn double step should be valid", () => {
    board = newBoard();
    move = { from: 8, to: 24 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 7 board state:`, stateAfter);
    console.log(`Test 7 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 0, "Pawn double step valid");
  });
  if (error) failures.push(error);
  
  error = runTest(8, "Pawn backward move", () => {
    board = newBoard();
    board.setPieceAt(0, 0);
    move = { from: 8, to: 0 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to] || "N/A";
    console.log(`Test 8 board state:`, stateAfter);
    console.log(`Test 8 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, MoveValidationResult.ILLEGAL_PAWN_MOVE, "Pawn backward move invalid");
  });
  if (error) failures.push(error);
  
  error = runTest(9, "Pawn diagonal capture should be valid", () => {
    board = newBoard();
    board.setPieceAt(18, PIECES.BLACK_PAWN);
    move = { from: 9, to: 18 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 9 board state:`, stateAfter);
    console.log(`Test 9 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 0, "Pawn diagonal capture valid");
  });
  if (error) failures.push(error);
  
  error = runTest(10, "Pawn diagonal without capture", () => {
    board = newBoard();
    move = { from: 9, to: 18 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 10 board state:`, stateAfter);
    console.log(`Test 10 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, MoveValidationResult.ILLEGAL_PAWN_MOVE, "Pawn diagonal without capture invalid");
  });
  if (error) failures.push(error);
  
  error = runTest(11, "Knight valid move", () => {
    board = newBoard();
    board.setPieceAt(11, 0);
    move = { from: 1, to: 11 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 11 board state:`, stateAfter);
    console.log(`Test 11 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 0, "Knight valid move");
  });
  if (error) failures.push(error);
  
  error = runTest(12, "Knight invalid move", () => {
    board = newBoard();
    move = { from: 1, to: 2 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 12 board state:`, stateAfter);
    console.log(`Test 12 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 32, "Knight invalid move");
  });
  if (error) failures.push(error);
  
  error = runTest(13, "Bishop valid diagonal move", () => {
    board = newBoard();
    board.setPieceAt(9, 0);
    move = { from: 2, to: 16 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 13 board state:`, stateAfter);
    console.log(`Test 13 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 0, "Bishop valid diagonal move");
  });
  if (error) failures.push(error);
  
  error = runTest(14, "Bishop non-diagonal move", () => {
    board = newBoard();
    move = { from: 2, to: 3 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 14 board state:`, stateAfter);
    console.log(`Test 14 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 64, "Bishop non-diagonal move");
  });
  if (error) failures.push(error);
  
  error = runTest(15, "Rook move with blocked path", () => {
    board = newBoard();
    move = { from: 0, to: 3 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 15 board state:`, stateAfter);
    console.log(`Test 15 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 1024, "Rook move with blocked path");
  });
  if (error) failures.push(error);
  
  error = runTest(16, "Rook move after clearing path", () => {
    board = newBoard();
    board.setPieceAt(1, 0);
    board.setPieceAt(2, 0);
    board.setPieceAt(3, 0);
    move = { from: 0, to: 3 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 16 board state:`, stateAfter);
    console.log(`Test 16 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 0, "Rook move after clearing path");
  });
  if (error) failures.push(error);
  
  error = runTest(17, "Queen valid straight move", () => {
    board = newBoard();
    board.setPieceAt(11, 0);
    move = { from: 3, to: 11 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 17 board state:`, stateAfter);
    console.log(`Test 17 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 0, "Queen valid straight move");
  });
  if (error) failures.push(error);
  
  error = runTest(18, "Queen invalid move", () => {
    board = newBoard();
    move = { from: 3, to: 10 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 18 board state:`, stateAfter);
    console.log(`Test 18 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 256, "Queen invalid move");
  });
  if (error) failures.push(error);
  
  error = runTest(19, "King valid move", () => {
    board = newBoard();
    board.setPieceAt(12, 0);
    move = { from: 4, to: 12 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 19 board state:`, stateAfter);
    console.log(`Test 19 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 0, "King valid move");
  });
  if (error) failures.push(error);
  
  error = runTest(20, "King move too far", () => {
    board = newBoard();
    move = { from: 4, to: 20 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 20 board state:`, stateAfter);
    console.log(`Test 20 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, MoveValidationResult.ILLEGAL_KING_MOVE, "King move too far");
  });
  if (error) failures.push(error);
  
  error = runTest(21, "Combined error (empty source & out-of-bounds)", () => {
    board = newBoard();
    move = { from: 20, to: 70 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from] || "N/A";
    let destValue = stateAfter[move.to] || "N/A";
    console.log(`Test 21 board state:`, stateAfter);
    console.log(`Test 21 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, MoveValidationResult.NO_PIECE_AT_SOURCE, "Combined error on empty source/out-of-bounds");
  });
  if (error) failures.push(error);
  
  error = runTest(22, "Combined error (wrong turn & knight invalid move)", () => {
    board = newBoard();
    board.currentTurn = "black";
    move = { from: 1, to: 2 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 22 board state:`, stateAfter);
    console.log(`Test 22 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 36, "Combined error for wrong turn & knight invalid move");
  });
  if (error) failures.push(error);
  
  error = runTest(23, "Combined error (destination friendly & pawn illegal move)", () => {
    board = newBoard();
    board.setPieceAt(10, PIECES.WHITE_PAWN);
    move = { from: 8, to: 10 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from];
    let destValue = stateAfter[move.to];
    console.log(`Test 23 board state:`, stateAfter);
    console.log(`Test 23 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 24, "Combined error for destination friendly & pawn illegal move");
  });
  if (error) failures.push(error);
  
  error = runTest(24, "Combined error on out-of-bounds move", () => {
    board = newBoard();
    move = { from: -2, to: 70 };
    result = board.validateMove(move);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[move.from] || "N/A";
    let destValue = stateAfter[move.to] || "N/A";
    console.log(`Test 24 board state:`, stateAfter);
    console.log(`Test 24 - source value: ${sourceValue}, destination value: ${destValue}`);
    assertEqual(result, 3, "Combined error for out-of-bounds move");
  });
  if (error) failures.push(error);
  
  // --- Advanced Functionality Tests ---
  
  // Test 25: Check detection.
  error = runTest(25, "King in check detection", () => {
    board = newBoard();
    // Clear white pawn at index 12 and black pawn at index 52 so the file is open.
    board.setPieceAt(12, 0);
    board.setPieceAt(52, 0);
    // Place a black rook at index 60 so it attacks white king at index 4.
    board.setPieceAt(60, PIECES.BLACK_ROOK);
    let stateAfter = board.getGameState();
    let sourceValue = stateAfter[4];
    let destValue = stateAfter[60];
    console.log(`Test 25 board state:`, stateAfter);
    console.log(`Test 25 - King at index 4: ${sourceValue}, Black rook at index 60: ${destValue}`);
    const inCheck = board.isKingInCheck("white");
    assertEqual(inCheck, true, "White king should be in check");
  });
  if (error) failures.push(error);
  
  // Test 26: Checkmate detection.
  error = runTest(26, "Checkmate detection", () => {
    board = newBoard();
    // Clear the board.
    for (let i = 0; i < 64; i++) {
      board.setPieceAt(i, 0);
    }
    // Place white king at index 0, black queen at index 1, and black king at index 9.
    board.setPieceAt(0, PIECES.WHITE_KING);
    board.setPieceAt(1, PIECES.BLACK_QUEEN);
    board.setPieceAt(9, PIECES.BLACK_KING);
    board.currentTurn = "white";
    const checkmate = board.isCheckmate("white");
    assertEqual(checkmate, true, "White should be checkmated");
  });
  if (error) failures.push(error);
  
  // Test 27: Stalemate detection.
  error = runTest(27, "Stalemate detection", () => {
    board = newBoard();
    // Clear the board.
    for (let i = 0; i < 64; i++) board.setPieceAt(i, 0);
    // Place black king at index 63 (h8), white king at index 53 (f7),
    // and white queen at index 46 (g6) – a known stalemate position.
    board.setPieceAt(63, PIECES.BLACK_KING);
    board.setPieceAt(53, PIECES.WHITE_KING);
    board.setPieceAt(46, PIECES.WHITE_QUEEN);
    board.currentTurn = "black";
    const stalemate = board.isStalemate("black");
    assertEqual(stalemate, true, "Black should be stalemated");
  });
  if (error) failures.push(error);
  
  // Test 28: Castling availability.
  error = runTest(28, "Castling available", () => {
    board = newBoard();
    // Clear squares between white king (index 4) and kingside rook (index 7).
    board.setPieceAt(5, 0);
    board.setPieceAt(6, 0);
    const canCastle = board.canCastle("white", "kingside");
    assertEqual(canCastle, true, "White kingside castling should be available");
  });
  if (error) failures.push(error);
  
  // Test 29: Perform castling.
  error = runTest(29, "Perform castling", () => {
    board = newBoard();
    // Clear squares 5 and 6.
    board.setPieceAt(5, 0);
    board.setPieceAt(6, 0);
    board.performCastling("white", "kingside");
    const stateAfter = board.getGameState();
    assertEqual(stateAfter[6], PIECES.WHITE_KING, "White king should be at index 6 after castling");
    assertEqual(stateAfter[5], PIECES.WHITE_ROOK, "White rook should be at index 5 after castling");
  });
  if (error) failures.push(error);
  
  // Test 30: En passant (stub).
  error = runTest(30, "En passant validation", () => {
    board = newBoard();
    board.enPassantSquare = 20;
    move = { from: 12, to: 20 };
    result = board.validateEnPassant(move);
    assertEqual(result, 0, "En passant move should be valid when en passant square is set");
  });
  if (error) failures.push(error);
  
  // Test 31: Pawn promotion.
  error = runTest(31, "Pawn promotion", () => {
    board = newBoard();
    // Set up promotion: place a white pawn at index 55 and clear index 63.
    board.setPieceAt(55, PIECES.WHITE_PAWN);
    board.setPieceAt(63, 0);
    move = { from: 55, to: 63, piece: PIECES.WHITE_PAWN };
    result = board.validateMove(move);
    assertEqual(result, 0, "Promotion move valid before execution");
    board.performPromotion(move, PIECES.WHITE_QUEEN);
    const promoted = board.getPieceAt(63);
    assertEqual(promoted, PIECES.WHITE_QUEEN, "Pawn should be promoted to queen");
  });
  if (error) failures.push(error);
  
  // Test 32: FEN export and parse.
  error = runTest(32, "FEN export and parse", () => {
    board = newBoard();
    const fen = board.exportFEN();
    const board2 = newBoard();
    board2.loadGame(board.getGameState());
    const state1 = board.getGameState();
    const state2 = board2.getGameState();
    for (let i = 0; i < 64; i++) {
      assertEqual(state1[i], state2[i], `FEN load mismatch at square ${i}`);
    }
  });
  if (error) failures.push(error);
  
  // Test 33: PGN export and parse.
  error = runTest(33, "PGN export and parse", () => {
    const moves = ["e4", "e5", "Nf3", "Nc6", "Bb5"];
    const pgn = board.exportPGN(moves);
    const parsed = board.parsePGN(pgn);
    assertEqual(parsed.join(" "), moves.join(" "), "PGN export/parse consistency");
  });
  if (error) failures.push(error);
  
  // Print summary.
  if (failures.length > 0) {
    console.error("Some tests failed:");
    failures.forEach(msg => console.error(msg));
    console.error(`\n${failures.length} test(s) failed.`);
  } else {
    console.log("All tests passed successfully.");
  }
}

runTests();
