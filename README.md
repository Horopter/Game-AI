# Game-AI: Chess Engine in p5.js

A comprehensive chess engine implementation with multiple board representations and a React-based p5.js visualization.

## Overview

This project contains two main components:

1. **chess-engine**: Multiple chess engine implementations with different board representations
2. **chess-2020**: React application with p5.js visualization for interactive chess gameplay

## Features

### Chess Engine Implementations

The project includes six different chess engine implementations, each using a different board representation strategy:

1. **NaiveChess**: Simple 8x8 array representation with piece objects
2. **FENChess**: FEN string-based board representation
3. **HuffmanChess**: Huffman-compressed board state using Base64 encoding
4. **MoreCompressedChess**: FEN-like compressed representation
5. **UltraCompressedChess**: BigInt-based ultra-compressed representation (4 bits per square)
6. **BitboardChess**: Bitboard representation with advanced features (castling, en passant, promotion)

### Core Functionality

All engines implement the complete `ChessInterface` API:

- **Basic Methods**:
  - `initializeBoard()`: Set up standard starting position
  - `loadGame(state)`: Load a game state
  - `getGameState()`: Get current board state
  - `validateMove(move)`: Validate a chess move
  - `movePiece(move)`: Execute a validated move

- **Advanced Methods**:
  - `isKingInCheck(color)`: Check if king is in check
  - `getLegalMoves(color)`: Get all legal moves for a color
  - `isCheckmate(color)`: Detect checkmate
  - `isStalemate(color)`: Detect stalemate
  - `canCastle(color, side)`: Check castling availability
  - `performCastling(color, side)`: Execute castling
  - `validateEnPassant(move)`: Validate en passant capture
  - `performPromotion(move, promotionPiece)`: Promote a pawn
  - `parseFEN(fen)`: Parse FEN notation
  - `exportFEN()`: Export to FEN notation
  - `parsePGN(pgn)`: Parse PGN notation
  - `exportPGN(moves)`: Export to PGN notation

### Move Validation

The engine uses a bit-flag system for move validation, allowing multiple error conditions to be reported simultaneously:

- `VALID` (0): Move is valid
- `OUT_OF_BOUNDS` (1): Source or destination out of bounds
- `NO_PIECE_AT_SOURCE` (2): No piece at source square
- `WRONG_TURN` (4): Piece belongs to wrong player
- `DESTINATION_OCCUPIED_BY_FRIENDLY` (8): Destination has friendly piece
- `ILLEGAL_PAWN_MOVE` (16): Invalid pawn movement
- `ILLEGAL_KNIGHT_MOVE` (32): Invalid knight movement
- `ILLEGAL_BISHOP_MOVE` (64): Invalid bishop movement
- `ILLEGAL_ROOK_MOVE` (128): Invalid rook movement
- `ILLEGAL_QUEEN_MOVE` (256): Invalid queen movement
- `ILLEGAL_KING_MOVE` (512): Invalid king movement
- `PATH_NOT_CLEAR` (1024): Path blocked for sliding pieces

## Installation

### Chess Engine

```bash
cd chess-engine
npm install
```

### Chess 2020 (React App)

```bash
cd chess-2020
npm install
```

## Usage

### Chess Engine

```javascript
import NaiveChess from './src/NaiveChess/index.js';
import { MoveValidationResult } from './src/MoveValidationResult/index.js';

const board = new NaiveChess();
board.currentTurn = "white";

// Validate a move
const move = { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } };
const result = board.validateMove(move);

if (result === MoveValidationResult.VALID) {
  board.movePiece(move);
  console.log("Move executed!");
}

// Check game state
if (board.isKingInCheck("white")) {
  console.log("White king is in check!");
}

if (board.isCheckmate("white")) {
  console.log("White is checkmated!");
}

// Export to FEN
const fen = board.exportFEN();
console.log("FEN:", fen);
```

### Chess 2020

```bash
cd chess-2020
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Testing

### Run All Tests

```bash
cd chess-engine
npm test
```

### Individual Test Suites

- **Basic Move Validation**: Tests for all piece types and move validation
- **Advanced Features**: Tests for check, checkmate, stalemate, FEN/PGN operations
- **Historical Positions**: Tests using famous chess positions from history:
  - Fool's Mate
  - Scholar's Mate
  - Back Rank Mate
  - Immortal Game (Anderssen vs Kieseritzky, 1851)
  - Evergreen Game (Anderssen vs Dufresne, 1852)
  - Opera Game (Morphy vs Allies, 1858)
  - Kasparov's Immortal (Kasparov vs Topalov, 1999)
  - Fischer's Game of the Century (Fischer vs Byrne, 1956)
  - Deep Blue vs Kasparov (1997)
  - Stalemate positions
  - Smothered Mate
  - Legal's Mate

### Run Specific Tests

```bash
# Basic tests
node tests/NaiveChess/NaiveChess.test.js
node tests/FENChess/FENChess.test.js
node tests/BitboardChess/BitboardChess.test.js

# Advanced features
node tests/AdvancedFeatures.test.js

# Historical positions
node tests/HistoricalPositions.test.js
```

## Project Structure

```
Game-AI/
├── chess-engine/
│   ├── src/
│   │   ├── NaiveChess/
│   │   ├── FENChess/
│   │   ├── HuffmanChess/
│   │   ├── MoreCompressedChess/
│   │   ├── UltraCompressedChess/
│   │   ├── BitboardChess/
│   │   ├── ChessInterface/
│   │   └── MoveValidationResult/
│   ├── tests/
│   │   ├── NaiveChess/
│   │   ├── FENChess/
│   │   ├── BitboardChess/
│   │   ├── AdvancedFeatures.test.js
│   │   └── HistoricalPositions.test.js
│   └── package.json
├── chess-2020/
│   ├── src/
│   │   ├── models/
│   │   │   ├── ChessBoard.js
│   │   │   ├── Chesspiece.js
│   │   │   ├── Pawn.js
│   │   │   ├── Rook.js
│   │   │   ├── Knight.js
│   │   │   ├── Bishop.js
│   │   │   ├── Queen.js
│   │   │   └── King.js
│   │   └── App.js
│   └── package.json
└── README.md
```

## Chess Rules Implemented

- ✅ Basic piece movement (pawn, rook, knight, bishop, queen, king)
- ✅ Move validation with comprehensive error reporting
- ✅ Check detection
- ✅ Checkmate detection
- ✅ Stalemate detection
- ✅ Legal move generation (excluding moves that leave king in check)
- ✅ Pawn promotion
- ✅ Castling (BitboardChess)
- ✅ En passant (BitboardChess)
- ✅ FEN notation support
- ✅ PGN notation support
- ✅ Turn management

## Performance Considerations

Different engine implementations offer different trade-offs:

- **NaiveChess**: Simplest implementation, easiest to understand
- **FENChess**: Good for human-readable board states
- **HuffmanChess**: Compressed storage, good for serialization
- **UltraCompressedChess**: Minimal memory footprint (BigInt)
- **BitboardChess**: Fast bitwise operations, best for AI/search algorithms

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting a pull request.

## License

MIT License - see LICENSE file for details

## Author

Santosh Kumar Desai

## Acknowledgments

- Chess rules based on FIDE standard rules
- Historical positions from famous chess games
- p5.js for visualization

