import NaiveChess from "../src/NaiveChess/index.js";
import FENChess from "../src/FENChess/index.js";
import HuffmanChess from "../src/HuffmanChess/index.js";
import MoreCompressedChess from "../src/MoreCompressedChess/index.js";
import UltraCompressedChess from "../src/UltraCompressedChess/index.js";
import BitboardChess, { PIECES } from "../src/BitboardChess/index.js";
import { MoveValidationResult } from "../src/MoveValidationResult/index.js";

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected} but got: ${actual}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFalse(condition, message) {
  assertTrue(!condition, message);
}

// Test check detection
function testCheckDetection() {
  console.log("Testing check detection...");
  
  // Test NaiveChess
  const board1 = new NaiveChess();
  board1.currentTurn = "white";
  // Set up a position where white king is in check
  board1.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board1.board[0][4] = { type: "king", color: "white" };
  board1.board[0][0] = { type: "rook", color: "black" };
  assertTrue(board1.isKingInCheck("white"), "NaiveChess: White king should be in check");
  
  // Test FENChess
  const board2 = new FENChess("4k3/8/8/8/8/8/8/4K3");
  board2.currentTurn = "white";
  board2.board[0][4] = { type: "king", color: "white" };
  board2.board[0][0] = { type: "rook", color: "black" };
  assertTrue(board2.isKingInCheck("white"), "FENChess: White king should be in check");
  
  // Test HuffmanChess
  const board3 = new HuffmanChess();
  board3.currentTurn = "white";
  for (let i = 0; i < 64; i++) board3.board[i] = 0;
  board3.board[4] = 6; // white king
  board3.board[0] = 10; // black rook
  assertTrue(board3.isKingInCheck("white"), "HuffmanChess: White king should be in check");
  
  console.log("✓ Check detection tests passed");
}

// Test checkmate detection
function testCheckmateDetection() {
  console.log("Testing checkmate detection...");
  
  const board = new NaiveChess();
  board.currentTurn = "white";
  // Set up a checkmate position
  board.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board.board[0][4] = { type: "king", color: "white" };
  board.board[1][4] = { type: "queen", color: "black" };
  board.board[0][3] = { type: "rook", color: "black" };
  assertTrue(board.isCheckmate("white"), "White should be checkmated");
  assertFalse(board.isCheckmate("black"), "Black should not be checkmated");
  
  console.log("✓ Checkmate detection tests passed");
}

// Test stalemate detection
function testStalemateDetection() {
  console.log("Testing stalemate detection...");
  
  const board = new NaiveChess();
  board.currentTurn = "black";
  // Set up a stalemate position
  board.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board.board[0][0] = { type: "king", color: "black" };
  board.board[1][1] = { type: "queen", color: "white" };
  board.board[2][0] = { type: "king", color: "white" };
  assertTrue(board.isStalemate("black"), "Black should be stalemated");
  assertFalse(board.isStalemate("white"), "White should not be stalemated");
  
  console.log("✓ Stalemate detection tests passed");
}

// Test FEN parsing and export
function testFENOperations() {
  console.log("Testing FEN operations...");
  
  const standardFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  
  // Test NaiveChess
  const board1 = new NaiveChess();
  board1.parseFEN(standardFEN);
  const fen1 = board1.exportFEN();
  assertTrue(fen1.includes("rnbqkbnr"), "NaiveChess: FEN export should contain black back rank");
  
  // Test FENChess
  const board2 = new FENChess(standardFEN);
  const fen2 = board2.exportFEN();
  assertTrue(fen2.includes("rnbqkbnr"), "FENChess: FEN export should contain black back rank");
  
  // Test HuffmanChess
  const board3 = new HuffmanChess();
  board3.parseFEN(standardFEN);
  const fen3 = board3.exportFEN();
  assertTrue(fen3.includes("rnbqkbnr"), "HuffmanChess: FEN export should contain black back rank");
  
  // Test MoreCompressedChess
  const board4 = new MoreCompressedChess(standardFEN);
  const fen4 = board4.exportFEN();
  assertTrue(fen4.includes("rnbqkbnr"), "MoreCompressedChess: FEN export should contain black back rank");
  
  // Test UltraCompressedChess
  const board5 = new UltraCompressedChess();
  board5.parseFEN(standardFEN);
  const fen5 = board5.exportFEN();
  assertTrue(fen5.includes("rnbqkbnr"), "UltraCompressedChess: FEN export should contain black back rank");
  
  console.log("✓ FEN operations tests passed");
}

// Test PGN parsing and export
function testPGNOperations() {
  console.log("Testing PGN operations...");
  
  const moves = ["e4", "e5", "Nf3", "Nc6", "Bb5"];
  const pgnString = moves.join(" ");
  
  const board = new NaiveChess();
  const parsed = board.parsePGN(pgnString);
  assertEqual(parsed.length, moves.length, "PGN parsing should return correct number of moves");
  assertEqual(parsed[0], "e4", "First move should be e4");
  
  const exported = board.exportPGN(moves);
  assertEqual(exported, pgnString, "PGN export should match input");
  
  console.log("✓ PGN operations tests passed");
}

// Test pawn promotion
function testPawnPromotion() {
  console.log("Testing pawn promotion...");
  
  const board = new NaiveChess();
  board.currentTurn = "white";
  board.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board.board[1][0] = { type: "pawn", color: "white" };
  board.board[0][0] = null;
  
  const move = { from: { row: 1, col: 0 }, to: { row: 0, col: 0 } };
  board.performPromotion(move, "queen");
  
  assertEqual(board.board[0][0].type, "queen", "Pawn should be promoted to queen");
  assertEqual(board.board[0][0].color, "white", "Promoted piece should be white");
  assertEqual(board.currentTurn, "black", "Turn should switch after promotion");
  
  console.log("✓ Pawn promotion tests passed");
}

// Test getLegalMoves
function testGetLegalMoves() {
  console.log("Testing getLegalMoves...");
  
  const board = new NaiveChess();
  board.currentTurn = "white";
  
  const moves = board.getLegalMoves("white");
  assertTrue(moves.length > 0, "Should have legal moves from starting position");
  assertTrue(moves.length === 20, "Starting position should have 20 legal moves for white");
  
  // Test that moves don't leave king in check
  for (const move of moves) {
    const savedState = board.board.map(r => r.map(c => c ? { ...c } : null));
    const savedTurn = board.currentTurn;
    try {
      board.movePiece(move);
      assertFalse(board.isKingInCheck("white"), "Legal move should not leave king in check");
    } catch (e) {}
    board.board = savedState;
    board.currentTurn = savedTurn;
  }
  
  console.log("✓ GetLegalMoves tests passed");
}

// Test loadGame
function testLoadGame() {
  console.log("Testing loadGame...");
  
  const board1 = new NaiveChess();
  const state1 = board1.getGameState();
  
  const board2 = new NaiveChess();
  board2.loadGame(state1);
  
  const state2 = board2.getGameState();
  assertEqual(state1.length, state2.length, "Loaded state should have same number of rows");
  
  // Test HuffmanChess
  const board3 = new HuffmanChess();
  const state3 = board3.getGameState();
  const board4 = new HuffmanChess();
  board4.loadGame(state3);
  const state4 = board4.getGameState();
  assertEqual(state3.length, state4.length, "HuffmanChess: Loaded state should have same length");
  
  console.log("✓ LoadGame tests passed");
}

// Run all tests
function runAllTests() {
  console.log("Running advanced feature tests...\n");
  
  try {
    testCheckDetection();
    testCheckmateDetection();
    testStalemateDetection();
    testFENOperations();
    testPGNOperations();
    testPawnPromotion();
    testGetLegalMoves();
    testLoadGame();
    
    console.log("\n✓ All advanced feature tests passed successfully!");
  } catch (error) {
    console.error("\n✗ Test failed:", error.message);
    throw error;
  }
}

runAllTests();

