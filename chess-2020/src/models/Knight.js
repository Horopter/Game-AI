import Chesspiece from './Chesspiece'

class Knight extends Chesspiece {
    constructor(initPosX, initPosY, pieceColor, cb) {
      super(initPosX, initPosY, pieceColor);
      this.id = this.pieceColor ? 7 : 8;
      this.cb = cb;
      this.sketch = this.cb.sketch;
      this.markOnGrid();
      this.update();
    }
    fetchPossiblePositions() {
      this.appendMove(1, 2, true);
      this.appendMove(-1, 2, true);
      this.appendMove(1, -2, true);
      this.appendMove(-1, -2, true);
      this.appendMove(2, 1, true);
      this.appendMove(-2, 1, true);
      this.appendMove(2, -1, true);
      this.appendMove(-2, -1, true);
  
      this.appendMove(1, 2, false);
      this.appendMove(-1, 2, false);
      this.appendMove(1, -2, false);
      this.appendMove(-1, -2, false);
      this.appendMove(2, 1, false);
      this.appendMove(-2, 1, false);
      this.appendMove(2, -1, false);
      this.appendMove(-2, -1, false);
    }
    update() {
      if (this.isAlive) {
        super.update();
        this.clearPossiblePositions();
        this.fetchPossiblePositions();
      }
    }
  }

export default Knight