import MoreCompressedChess from "../../src/MoreCompressedChess/index.js";
import { MoveValidationResult } from "../../src/MoveValidationResult/index.js";

// Enhanced assert function.
function assertEqual(actual, expected, message, board, move) {
  if (actual !== expected) {
    console.error("Test failed!");
    if (board && typeof board.getGameState === "function") {
      console.error("Board configuration:");
      console.table(board.getGameState());
    }
    if (move) {
      console.error("Move attempted:");
      console.dir(move);
    }
    console.error(`Expected: ${expected} but got: ${actual}`);
    throw new Error(message || "Assertion failed");
  }
}

function newBoard() {
  const b = new MoreCompressedChess();
  b.currentTurn = "white";
  return b;
}

function runTests() {
  console.log("Starting 27-bitflag MoreCompressedChess comprehensive tests...");

  // -------- General Validations --------
  // Test 1: Out-of-bounds source.
  let board = newBoard();
  let move = { from: { row: -1, col: 0 }, to: { row: 0, col: 0 } };
  let result = board.validateMove(move);
  // Expected: OUT_OF_BOUNDS (1) | NO_PIECE_AT_SOURCE (2) = 3.
  assertEqual(result, 3, "Test 1 failed: Out-of-bounds source", board, move);

  // Test 2: Out-of-bounds destination.
  board = newBoard();
  move = { from: { row: 6, col: 0 }, to: { row: 8, col: 0 } };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.OUT_OF_BOUNDS, "Test 2 failed: Out-of-bounds destination", board, move);

  // Test 3: No piece at source.
  board = newBoard();
  move = { from: { row: 4, col: 4 }, to: { row: 3, col: 4 } };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.NO_PIECE_AT_SOURCE, "Test 3 failed: Empty source", board, move);

  // Test 4: Wrong turn.
  board = newBoard();
  board.currentTurn = "black";
  move = { from: { row: 6, col: 0 }, to: { row: 5, col: 0 } };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.WRONG_TURN, "Test 4 failed: Wrong turn", board, move);

  // Test 5: Destination occupied by friendly piece.
  board = newBoard();
  let state = board.getGameState();
  state[5][0] = { type: "pawn", color: "white" };
  board.loadGame(state);
  move = { from: { row: 6, col: 0 }, to: { row: 5, col: 0 } };
  result = board.validateMove(move);
  // Expect: DESTINATION_OCCUPIED_BY_FRIENDLY (8) | ILLEGAL_PAWN_MOVE (16) = 24.
  assertEqual(result, 24, "Test 5 failed: Destination friendly", board, move);

  // -------- Pawn Moves --------
  // Test 6: Valid white pawn single step: (6,0)->(5,0)
  board = newBoard();
  move = { from: { row: 6, col: 0 }, to: { row: 5, col: 0 } };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 6 failed: Pawn single step should be valid", board, move);

  // Test 7: Valid white pawn double step: (6,1)->(4,1)
  board = newBoard();
  move = { from: { row: 6, col: 1 }, to: { row: 4, col: 1 } };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 7 failed: Pawn double step should be valid", board, move);

  // Test 8: Invalid white pawn backward move: (6,0)->(7,0)
  board = newBoard();
  state = board.getGameState();
  state[7][0] = null;
  board.loadGame(state);
  move = { from: { row: 6, col: 0 }, to: { row: 7, col: 0 } };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_PAWN_MOVE, "Test 8 failed: Pawn backward move", board, move);

  // Test 9: Valid white pawn diagonal capture: (6,2)->(5,3)
  board = newBoard();
  state = board.getGameState();
  state[5][3] = { type: "pawn", color: "black" };
  board.loadGame(state);
  move = { from: { row: 6, col: 2 }, to: { row: 5, col: 3 } };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 9 failed: Pawn diagonal capture should be valid", board, move);

  // Test 10: Invalid white pawn diagonal move without capture: (6,2)->(5,3)
  board = newBoard();
  move = { from: { row: 6, col: 2 }, to: { row: 5, col: 3 } };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_PAWN_MOVE, "Test 10 failed: Pawn diagonal without capture", board, move);

  // -------- Knight Moves --------
  // Test 11: Valid knight move: (7,1)->(5,2)
  board = newBoard();
  move = { from: { row: 7, col: 1 }, to: { row: 5, col: 2 } };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 11 failed: Knight valid move", board, move);

  // Test 12: Invalid knight move (wrong shape): (7,1)->(7,3)
  board = newBoard();
  state = board.getGameState();
  state[7][3] = null;
  board.loadGame(state);
  move = { from: { row: 7, col: 1 }, to: { row: 7, col: 3 } };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_KNIGHT_MOVE, "Test 12 failed: Knight invalid move", board, move);

  // -------- Bishop Moves --------
  // Test 13: Valid bishop move: (7,2)->(5,4)
  board = newBoard();
  state = board.getGameState();
  state[6][3] = null;
  board.loadGame(state);
  move = { from: { row: 7, col: 2 }, to: { row: 5, col: 4 } };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 13 failed: Bishop valid diagonal move", board, move);

  // Test 14: Invalid bishop move (non-diagonal): (7,2)->(6,2)
  board = newBoard();
  state = board.getGameState();
  state[6][2] = null;
  board.loadGame(state);
  move = { from: { row: 7, col: 2 }, to: { row: 6, col: 2 } };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_BISHOP_MOVE, "Test 14 failed: Bishop non-diagonal move", board, move);

  // -------- Rook Moves --------
  // Test 15: Rook move with blocked path: (7,0)->(7,3)
  board = newBoard();
  state = board.getGameState();
  state[7][3] = null;
  board.loadGame(state);
  move = { from: { row: 7, col: 0 }, to: { row: 7, col: 3 } };
  result = board.validateMove(move);
  // Expected: PATH_NOT_CLEAR (1024) because pieces at (7,1) and (7,2) block the path.
  assertEqual(result, MoveValidationResult.PATH_NOT_CLEAR, "Test 15 failed: Rook move with blocked path", board, move);

  // Test 16: Valid rook move after clearing path: (7,0)->(7,3)
  board = newBoard();
  state = board.getGameState();
  state[7][1] = null;
  state[7][2] = null;
  state[7][3] = null;
  board.loadGame(state);
  move = { from: { row: 7, col: 0 }, to: { row: 7, col: 3 } };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 16 failed: Rook move after clearing path", board, move);

  // -------- Queen Moves --------
  // Test 17: Valid queen move (diagonal): (7,3)->(5,1)
  board = newBoard();
  state = board.getGameState();
  state[6][2] = null;
  board.loadGame(state);
  move = { from: { row: 7, col: 3 }, to: { row: 5, col: 1 } };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 17 failed: Queen valid diagonal move", board, move);

  // Test 18: Valid queen move (straight): (7,3)->(7,5)
  board = newBoard();
  state = board.getGameState();
  state[7][4] = null;
  state[7][5] = null;
  board.loadGame(state);
  move = { from: { row: 7, col: 3 }, to: { row: 7, col: 5 } };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 18 failed: Queen valid straight move", board, move);

  // Test 19: Invalid queen move (neither straight nor diagonal): (7,3)->(5,2)
  board = newBoard();
  move = { from: { row: 7, col: 3 }, to: { row: 5, col: 2 } };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_QUEEN_MOVE, "Test 19 failed: Queen invalid move", board, move);

  // -------- King Moves --------
  // Test 20: Valid king move: (7,4)->(6,4)
  board = newBoard();
  state = board.getGameState();
  state[6][4] = null;
  board.loadGame(state);
  move = { from: { row: 7, col: 4 }, to: { row: 6, col: 4 } };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 20 failed: King valid move", board, move);

  // Test 21: Invalid king move: (7,4)->(5,4)
  board = newBoard();
  move = { from: { row: 7, col: 4 }, to: { row: 5, col: 4 } };
  result = board.validateMove(move);
  assertEqual(result, MoveValidationResult.ILLEGAL_KING_MOVE, "Test 21 failed: King move too far", board, move);

  // -------- Combined Error Tests --------
  // Test 22: Combined error – empty source & destination out-of-bounds.
  board = newBoard();
  move = { from: { row: 4, col: 4 }, to: { row: 9, col: 9 } };
  result = board.validateMove(move);
  // New policy: if source is in bounds but empty, return only NO_PIECE_AT_SOURCE (2).
  assertEqual(result, MoveValidationResult.NO_PIECE_AT_SOURCE, "Test 22 failed: Combined error (empty source & out-of-bounds)", board, move);

  // Test 23: Combined error – wrong turn & knight invalid move.
  board = newBoard();
  board.currentTurn = "black";
  state = board.getGameState();
  state[7][3] = null;
  board.loadGame(state);
  move = { from: { row: 7, col: 1 }, to: { row: 7, col: 3 } };
  result = board.validateMove(move);
  // Expected: WRONG_TURN (4) | ILLEGAL_KNIGHT_MOVE (32) = 36.
  assertEqual(result, 36, "Test 23 failed: Combined error (wrong turn & knight invalid move)", board, move);

  // Test 24: Combined error – pawn: destination occupied by friendly & illegal move shape.
  board = newBoard();
  state = board.getGameState();
  state[5][1] = { type: "pawn", color: "white" };
  board.loadGame(state);
  move = { from: { row: 6, col: 0 }, to: { row: 5, col: 1 } };
  result = board.validateMove(move);
  // Expected: DESTINATION_OCCUPIED_BY_FRIENDLY (8) | ILLEGAL_PAWN_MOVE (16) = 24.
  assertEqual(result, 24, "Test 24 failed: Combined error (destination friendly & pawn illegal move)", board, move);

  // Test 25: Combined error – out-of-bounds source & destination.
  board = newBoard();
  move = { from: { row: -2, col: 0 }, to: { row: 9, col: 9 } };
  result = board.validateMove(move);
  // Expected: OUT_OF_BOUNDS|NO_PIECE_AT_SOURCE = 1|2 = 3.
  assertEqual(result, 3, "Test 25 failed: Combined error on out-of-bounds move", board, move);

  // -------- Move Execution & Turn Switching --------
  // Test 26: Execute a valid white pawn move.
  board = newBoard();
  board.currentTurn = "white";
  move = { from: { row: 6, col: 0 }, to: { row: 5, col: 0 }, piece: 1 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 26 failed: Pawn move should be valid before execution", board, move);
  board.movePiece(move);
  state = board.getGameState();
  assertEqual(state[6][0], null, "Test 26 failed: Pawn source square not empty after execution", board, move);
  if (state[5][0] === null) {
    throw new Error("Test 26 failed: Pawn destination square is empty after execution.");
  }
  assertEqual(board.currentTurn, "black", "Test 26 failed: Turn did not switch after pawn move execution", board, move);

  // Test 27: Execute a valid knight move.
  board = newBoard();
  board.currentTurn = "white";
  move = { from: { row: 7, col: 1 }, to: { row: 5, col: 0 }, piece: 2 };
  result = board.validateMove(move);
  assertEqual(result, 0, "Test 27 failed: Knight move should be valid", board, move);
  board.movePiece(move);
  state = board.getGameState();
  assertEqual(state[7][1], null, "Test 27 failed: Knight source square not empty after move", board, move);
  if (!state[5][0]) {
    throw new Error("Test 27 failed: Knight destination square is empty after move execution.");
  }
  assertEqual(board.currentTurn, "black", "Test 27 failed: Turn did not switch after knight move", board, move);

  console.log("All 27 MoreCompressedChess tests passed successfully.");
}

runTests();
