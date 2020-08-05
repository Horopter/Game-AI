import Chesspiece from './Chesspiece'

class Queen extends Chesspiece {
    constructor(initPosX, initPosY, pieceColor, cb) {
      super(initPosX, initPosY, pieceColor);
      this.id = this.pieceColor ? 9 : 10;
      this.cb = cb;
      this.sketch = this.cb.sketch;
      this.markOnGrid();
      this.update();
    }
    /*
     * Ideally I'd have inherited from two classes
     * but JS is a tough language and we implement
     * this manually. Also, Queen doesn't technically
     * inherit anything from Rook or Bishop, so
     * it's ok.
     */
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
      for (i = 1; i < this.cb.numSquares; i++) {
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

  export default Queen