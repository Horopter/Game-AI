import Chesspiece from './Chesspiece';

class Bishop extends Chesspiece {
    constructor(initPosX, initPosY, pieceColor, cb) {
      super(initPosX, initPosY, pieceColor);
      this.cb = cb;
      this.sketch = this.cb.sketch;
      this.id = this.pieceColor ? 5 : 6;
      this.markOnGrid();
      this.update();
    }
    fetchPossiblePositions() {
      var isVacant;
      for (var i = 1; i < this.cb.numSquares; i++) {
        isVacant = this.appendMove(i, i, false);
        if (isVacant === false) {
          this.appendMove(i, i, true);
          break;
        }
      }
      for (i = 1; i < this.cb.numSquares; i++) {
        isVacant = this.appendMove(-i, -i, false);
        if (isVacant === false) {
          this.appendMove(-i, -i, true);
          break;
        }
      }
      for (i = 1; i < this.cb.numSquares; i++) {
        isVacant = this.appendMove(-i, i, false);
        if (isVacant === false) {
          this.appendMove(-i, i, true);
          break;
        }
      }
      for (i = 1; i < this.cb.numSquares; i++) {
        isVacant = this.appendMove(i, -i, false);
        if (isVacant === false) {
          this.appendMove(i, -i, true);
          break;
        }
      }
    }
    update() {
      if (this.isAlive) {
        super.update();
        this.clearPossiblePositions();
        this.fetchPossiblePositions();
      }
    }
  }
  
  export default Bishop;