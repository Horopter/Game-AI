import Bishop from '././Bishop'
import Rook from './Rook'
import Knight from './Knight'
import King from './King'
import Queen from './Queen'
import Pawn from './Pawn'

class ChessBoard {
    constructor(p) {
      this.sketch = p;
      this.numSquares = 8;
      this.playGrid = Array(this.numSquares).fill().map(() => Array(this.numSquares).fill(0));
    }
    init() {
      // 0 is for white and 1 for black
      this.myLeftRook = new Rook(0, 7, 0, this);
      this.myRightRook = new Rook(7, 7, 0, this);
      this.myleftKnight = new Knight(1, 7, 0, this);
      this.myRightKnight = new Knight(6, 7, 0, this);
      this.myLeftBishop = new Bishop(2, 7, 0, this);
      this.myRightBishop = new Bishop(5, 7, 0, this);
      this.myQueen = new Queen(3, 7, 0, this);
      this.myKing = new King(4, 7, 0, this);
      this.myPawns = [];
      for (var i = 0; i < 8; i++) {
        this.myPawns.push(new Pawn(i, 6, 0, this));
      }
  
      this.oppLeftRook = new Rook(0, 0, 1, this);
      this.oppRightRook = new Rook(7, 0, 1, this);
      this.oppleftKnight = new Knight(1, 0, 1, this);
      this.oppRightKnight = new Knight(6, 0, 1, this);
      this.oppLeftBishop = new Bishop(2, 0, 1, this);
      this.oppRightBishop = new Bishop(5, 0, 1, this);
      this.oppQueen = new Queen(3, 0, 1, this);
      this.oppKing = new King(4, 0, 1, this);
      this.oppPawns = [];
      for (i = 0; i < 8; i++) {
        this.oppPawns.push(new Pawn(i, 1, 1, this));
      }
  
      this.myChesspieces = [this.myLeftRook, 
        this.myRightRook, 
        this.myleftKnight, 
        this.myRightKnight, 
        this.myLeftBishop, 
        this.myRightBishop, 
        this.myQueen, 
        this.myKing
      ];
      this.myChesspieces.push(...this.myPawns);
  
      this.oppChesspieces = [this.oppLeftRook, 
        this.oppRightRook, 
        this.oppleftKnight, 
        this.oppRightKnight, 
        this.oppLeftBishop, 
        this.oppRightBishop, 
        this.oppQueen, 
        this.oppKing
      ];
      this.oppChesspieces.push(...this.oppPawns);
      this.allChesspieces = [];
      this.allChesspieces.push(...this.myChesspieces);
      this.allChesspieces.push(...this.oppChesspieces);
      this.grabbed = null;
      this.grabbedPiece = null;
      this.turn = 0;
    }
    notifyAttackFromGrabbedPiece() {
      let isKilled;
      for (var cp of this.allChesspieces) {
        isKilled = cp.checkAttackAndSelfDestruct(this.grabbedPiece);
        if (isKilled) {
          break;
        }
      }
    }
    update() {
      let pawn, x;
      for (pawn of this.myPawns) {
        if (pawn.isAlive && pawn.needsPromotion) {
          pawn.isAlive = false;
          x = new Queen(pawn.curPosX, pawn.curPosY, pawn.pieceColor,this);
          if (pawn.pieceColor === 0) {
            this.myChesspieces.push(x);
          } else {
            this.oppChesspieces.push(x);
          }
          this.allChesspieces.push(x);
          break;
        }
      }
      for (pawn of this.oppPawns) {
        if (pawn.isAlive && pawn.needsPromotion) {
          pawn.isAlive = false;
          x = new Queen(pawn.curPosX, pawn.curPosY, pawn.pieceColor,this);
          if (pawn.pieceColor === 0) {
            this.myChesspieces.push(x);
          } else {
            this.oppChesspieces.push(x);
          }
          this.allChesspieces.push(x);
          break;
        }
      }
    }
    flipTurn() {
      this.turn = 1 - this.turn;
    }
    isTurn(piece) {
      return this.turn === piece.id%2;
    }
    isValid(x) {
      return (0 <= x && x < this.numSquares);
    }
    isFilled(x, y) {
      if (this.isValid(x) &&
        this.isValid(y) &&
        this.playGrid &&
        this.playGrid[x] &&
        this.playGrid[x][y] !== 0) {
        return true;
      }
      return false;
    }
  }

export default ChessBoard;