import Chesspiece from './Chesspiece'

class Pawn extends Chesspiece {
    constructor(initPosX, initPosY, pieceColor, cb) {
      super(initPosX, initPosY, pieceColor);
      this.id = this.pieceColor ? 1 : 2;
      this.cb = cb;
      this.sketch = this.cb.sketch;
      this.direction = (this.cb.numSquares - this.posY) < 4 ? -1 : 1;
      this.needsPromotion = false;
      this.markOnGrid();
      this.update();
    }
    fetchPossibleMovePositions() {
      let reqY;
      if (this.isGrabbed) {
        reqY = this.grabPosY;
      } else {
        reqY = this.curPosY;
      }
      if (reqY === this.posY) {
        this.appendMove(0, this.direction, false);
        if (false === this.cb.isFilled(this.grabPosX, this.grabPosY + this.direction)) {
          this.appendMove(0, 2 * this.direction, false);
        }
      } else {
        this.appendMove(0, this.direction, false);
      }
    }
    fetchPossibleAttackPositions() {
      this.appendMove( 1, this.direction, true);
      this.appendMove(-1, this.direction, true);
    }
    fetchPossiblePositions() {
      this.fetchPossibleMovePositions();
      this.fetchPossibleAttackPositions();
    }
    update() {
      if (this.isAlive) {
        super.update();
        this.clearPossiblePositions();
        this.fetchPossiblePositions();
        // Pawn Promotion code
        if (this.curPosY === this.posY + (this.cb.numSquares - 2)*this.direction) {
          this.needsPromotion = true;
        }
      }
    }
  }

export default Pawn