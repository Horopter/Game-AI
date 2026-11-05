import Chesspiece from './Chesspiece'

class Rook extends Chesspiece {
    constructor(initPosX, initPosY, pieceColor, cb) {
      super(initPosX, initPosY, pieceColor);
      this.cb = cb;
      this.sketch = this.cb.sketch;
      this.id = this.pieceColor ? 3 : 4;
      this.markOnGrid();
      this.update();
    }
    fetchPossiblePositions() {
      var isVacant;
      for (var i = 1; i < this.cb.numSquares; i++) {
        isVacant = this.appendMove(0, i, false);
        if (isVacant === false) {
          this.appendMove(0, i, true);
          break;
        }
      }
      for (i = 1; i < this.cb.numSquares; i++) {
        isVacant = this.appendMove(0, -i, false);
        if (isVacant === false) {
          this.appendMove(0, -i, true);
          break;
        }
      }
      for (i = 1; i < this.cb.numSquares; i++) {
        isVacant = this.appendMove(i, 0, false);
        if (isVacant === false) {
          this.appendMove(i, 0, true);
          break;
        }
      }
      for (i = 1; i < this.cb.numSquares; i++) {
        isVacant = this.appendMove(-i, 0, false);
        if (isVacant === false) {
          this.appendMove(-i, 0, true);
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

  export default Rook