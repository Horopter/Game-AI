import HuffmanChess from "../../src/HuffmanChess/index.js";
import { MoveValidationResult } from "../../src/MoveValidationResult/index.js";

// Helper assert function.
function assertEqual(actual, expected, message, board, move) {
  if (actual !== expected) {
    console.error("Test failed!");
    if (board && typeof board.getGameStateArray === "function") {
      console.error("Board configuration:");
      console.table(board.getGameStateArray());
    }
    if (move) {
      console.error("Move attempted:");
      console.dir(move);
    }
    console.error(`Expected: ${expected} but got: ${actual}`);
    throw new Error(message || "Assertion failed");
  }
}

// Add helper to return board as an 8x8 2D array.
HuffmanChess.prototype.getGameStateArray = function () {
  const arr = [];
  for (let i = 0; i < 8; i++) {
    arr.push(this.board.slice(i * 8, i * 8 + 8));
  }
  return arr;
};

function newBoard() {
  const b = new HuffmanChess();
  b.currentTurn = "white";
  return b;
}

function runTests() {
  console.log("Starting 27-bitflag HuffmanChess comprehensive tests...");

  // -------- General Validations --------
  let board = newBoard();
  let move = { from: -1, to: 0 };
  let result = board.validateMove(move);
  // Expected: OUT_OF_BOUNDS (1) | NO_PIECE_AT_SOURCE (2) = 3.
  assertEqual(result, 3, "Test 1 failed: Out-of-bounds source", board, move);

  board = newBoard();
  move = { from: 48, to: 64 };
  result = board.validateMove(move);
  // Expect only OUT_OF_BOUNDS (1).
  assertEqual(result, MoveValidationResult.OUT_OF_BOUNDS, "Test 2 failed: Out-of-bounds destination", board, move);

  board = newBoard();
  move = { from: 20, to: 10 };
  result = board.validateMove(move);
  // Expected: NO_PIECE_AT_SOURCE (2)
  assertEqual(result, MoveValidationResult.NO_PIECE_AT_SOURCE, "Test 3 failed: Empty source", board, move);

  board = newBoard();
  board.currentTurn = "black";
  move = { from: 48, to: 40 };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.WRONG_TURN, "Test 4 failed: Wrong turn", board, move);

  board = newBoard();
  board.board[40] = 1; // set destination to white pawn.
  move = { from: 48, to: 40 };
  result = board.validateMove(move);
  // Expected: DESTINATION_OCCUPIED_BY_FRIENDLY (8) | ILLEGAL_PAWN_MOVE (16) = 24.
  assertEqual(result, 24, "Test 5 failed: Destination friendly", board, move);

  // -------- Pawn Moves --------
  board = newBoard();
  move = { from: 48, to: 40 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 6 failed: Pawn single step should be valid", board, move);

  board = newBoard();
  move = { from: 49, to: 33 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 7 failed: Pawn double step should be valid", board, move);

  board = newBoard();
  board.board[56] = 0;
  move = { from: 48, to: 56 };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_PAWN_MOVE, "Test 8 failed: Pawn backward move", board, move);

  board = newBoard();
  board.board[43] = 7;
  move = { from: 50, to: 43 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 9 failed: Pawn diagonal capture should be valid", board, move);

  board = newBoard();
  move = { from: 50, to: 43 };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_PAWN_MOVE, "Test 10 failed: Pawn diagonal without capture", board, move);

  // -------- Knight Moves --------
  board = newBoard();
  move = { from: 57, to: 42 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 11 failed: Knight valid move", board, move);

  board = newBoard();
  board.board[59] = 0;
  move = { from: 57, to: 59 };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_KNIGHT_MOVE, "Test 12 failed: Knight invalid move", board, move);

  // -------- Bishop Moves --------
  board = newBoard();
  board.board[51] = 0; // Clear (6,3) for bishop from (7,2) to (5,4).
  move = { from: 58, to: 44 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 13 failed: Bishop valid diagonal move", board, move);

  board = newBoard();
  board.board[50] = 0;
  move = { from: 58, to: 50 };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_BISHOP_MOVE, "Test 14 failed: Bishop non-diagonal move", board, move);

  // -------- Rook Moves --------
  board = newBoard();
  board.board[59] = 0;
  move = { from: 56, to: 59 };
  result = board.validateMove(move);
  // Expected: PATH_NOT_CLEAR (1024)
  assertEqual(result, MoveValidationResult.PATH_NOT_CLEAR, "Test 15 failed: Rook move with blocked path", board, move);

  board = newBoard();
  board.board[57] = 0;
  board.board[58] = 0;
  board.board[59] = 0;
  move = { from: 56, to: 59 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 16 failed: Rook move after clearing path", board, move);

  // -------- Queen Moves --------
  board = newBoard();
  board.board[50] = 0; // Clear (6,2) for queen from (7,3) to (5,1).
  move = { from: 59, to: 41 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 17 failed: Queen valid diagonal move", board, move);

  board = newBoard();
  board.board[60] = 0;
  board.board[61] = 0;
  move = { from: 59, to: 61 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 18 failed: Queen valid straight move", board, move);

  board = newBoard();
  move = { from: 59, to: 42 };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_QUEEN_MOVE, "Test 19 failed: Queen invalid move", board, move);

  // -------- King Moves --------
  board = newBoard();
  board.board[52] = 0;
  move = { from: 60, to: 52 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 20 failed: King valid move", board, move);

  board = newBoard();
  move = { from: 60, to: 44 };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_KING_MOVE, "Test 21 failed: King move too far", board, move);

  // -------- Combined Error Tests --------
  board = newBoard();
  move = { from: 20, to: 70 };
  result = board.validateMove(move);
  // Index 20 is in bounds but empty → return NO_PIECE_AT_SOURCE (2).
  assertEqual(result, MoveValidationResult.NO_PIECE_AT_SOURCE, "Test 22 failed: Combined error (empty source & out-of-bounds)", board, move);

  board = newBoard();
  board.currentTurn = "black";
  board.board[59] = 0;
  move = { from: 57, to: 59 };
  result = board.validateMove(move);
  // Expected: WRONG_TURN (4) | ILLEGAL_KNIGHT_MOVE (32) = 36.
  assertEqual(result, 36, "Test 23 failed: Combined error (wrong turn & knight invalid move)", board, move);

  board = newBoard();
  board.board[41] = 1; // white pawn at destination.
  move = { from: 48, to: 41 };
  result = board.validateMove(move);
  // Expected: DESTINATION_OCCUPIED_BY_FRIENDLY (8) | ILLEGAL_PAWN_MOVE (16) = 24.
  assertEqual(result, 24, "Test 24 failed: Combined error (destination friendly & pawn illegal move)", board, move);

  board = newBoard();
  move = { from: -2, to: 70 };
  result = board.validateMove(move);
  // Expected: OUT_OF_BOUNDS (1) | NO_PIECE_AT_SOURCE (2) = 3.
  assertEqual(result, 3, "Test 25 failed: Combined error on out-of-bounds move", board, move);

  // -------- Move Execution & Turn Switching --------
  board = newBoard();
  board.currentTurn = "white";
  move = { from: 48, to: 40, piece: 1 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 26 failed: Pawn move should be valid before execution", board, move);
  board.movePiece(move);
  let stateAfter = board.getGameState();
  let sourceValue = board.board[48];
  assertEqual(sourceValue, 0, "Test 26 failed: Pawn source square not empty after execution", board, move);
  let destValue = board.board[40];
  if (destValue === 0) {
    throw new Error("Test 26 failed: Pawn destination square is empty after execution.");
  }
  assertEqual(board.currentTurn, "black", "Test 26 failed: Turn did not switch after pawn move execution", board, move);

  board = newBoard();
  board.currentTurn = "white";
  move = { from: 57, to: 40, piece: 2 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 27 failed: Knight move should be valid", board, move);
  board.movePiece(move);
  stateAfter = board.getGameState();
  sourceValue = board.board[57];
  assertEqual(sourceValue, 0, "Test 27 failed: Knight source square not empty after move", board, move);
  destValue = board.board[40];
  if (destValue === 0) {
    throw new Error("Test 27 failed: Knight destination square is empty after move execution.");
  }
  assertEqual(board.currentTurn, "black", "Test 27 failed: Turn did not switch after knight move", board, move);

  console.log("All 27 HuffmanChess tests passed successfully.");
}

runTests();
