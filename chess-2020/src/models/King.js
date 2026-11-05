import Chesspiece from './Chesspiece'

class King extends Chesspiece {
    constructor(initPosX, initPosY, pieceColor, cb) {
      super(initPosX, initPosY, pieceColor);
      this.cb = cb;
      this.sketch = this.cb.sketch;
      this.id = this.pieceColor ? 11 : 12;
      this.markOnGrid();
      this.update();
    }
    fetchPossiblePositions() {
      this.appendMove(0, 1, false);
      this.appendMove(0, -1, false);
      this.appendMove(1, 1, false);
      this.appendMove(1, -1, false);
      this.appendMove(-1, 1, false);
      this.appendMove(-1, -1, false);
      this.appendMove(-1, 0, false);
      this.appendMove(1, 0, false);
  
      this.appendMove(0, 1, true);
      this.appendMove(0, -1, true);
      this.appendMove(1, 1, true);
      this.appendMove(1, -1, true);
      this.appendMove(-1, 1, true);
      this.appendMove(-1, -1, true);
      this.appendMove(-1, 0, true);
      this.appendMove(1, 0, true);
    }
    update() {
      if (this.isAlive) {
        super.update();
        this.clearPossiblePositions();
        this.fetchPossiblePositions();
      }
    }
  }

export default King;