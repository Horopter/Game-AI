import * as Constants from './Parameters';

class Chesspiece {
  constructor(initPosX, initPosY, pieceColor) {
    this.posX = initPosX;
    this.posY = initPosY;
    this.pieceColor = pieceColor;
    this.curPosX = this.posX;
    this.curPosY = this.posY;
    this.prevPosX = this.posX;
    this.prevPosY = this.posY;
    this.posXArray = [];
    this.posYArray = [];
    this.attackArray = [];
    this.grabbed = false;
    this.isAlive = true;
    this.isMoved = false;
  }
  updateCurrentPosition() {
    var radius = (Constants.sizeX * 1.0 / 2);
    var curMouseX = this.sketch.mouseX;
    var curMouseY = this.sketch.mouseY;
    this.curPosX = this.sketch.round((curMouseX - radius - Constants.drawOffsetX) * 1.0 / (Constants.sizeX));
    this.curPosY = this.sketch.round((curMouseY - radius - Constants.drawOffsetY) * 1.0 / (Constants.sizeY));
  }
  checkAndReset() {
    if (this.curPosX < 0 || this.curPosX > this.cb.numSquares - 1 ||
      this.curPosY < 0 || this.curPosY > this.cb.numSquares - 1) {
      this.resetPosition();
    }
  }
  markPreviousPosition() {
    this.holdX = this.prevPosX;
    this.holdY = this.prevPosY;
    this.prevPosX = this.grabPosX;
    this.prevPosY = this.grabPosY;
  }
  grab() {
    this.holdX = this.prevPosX;
    this.holdY = this.prevPosY;
    this.grabPosX = this.curPosX;
    this.grabPosY = this.curPosY;
    this.isGrabbed = true;
  }
  isGrabbable() {
    if (this.isAlive) {
      var radius = (Constants.sizeX * 1.0 / 2);
      var centerX = this.curPosX * Constants.sizeX + Constants.drawOffsetX + radius;
      var centerY = this.curPosY * Constants.sizeY + Constants.drawOffsetY + radius;
      var curMouseX = (this.sketch.mouseX);
      var curMouseY = (this.sketch.mouseY);
      var d = this.sketch.dist(curMouseX, curMouseY, centerX, centerY);
      if (d < radius) {
        return true;
      }
    }
    return false;
  }
  markOnGrid() {
    // mark the current position
    this.cb.playGrid[this.curPosX][this.curPosY] = this.id;
    if (this.prevPosX !== this.curPosX || this.prevPosY !== this.curPosY) {
      // empty out the previous position
      this.cb.playGrid[this.prevPosX][this.prevPosY] = 0;
      // actually used for only King and Rook and this happened to be LCA.
      this.isMoved = true;
    }
  }
  clearPossiblePositions() {
    this.posXArray = [];
    this.posYArray = [];
    this.attackArray = [];
  }
  validateMove(turn) {
    for (var a = 0; a < this.posXArray.length; a++) {
      if (this.curPosX === this.prevPosX + this.posXArray[a]) {
        if (this.curPosY === this.prevPosY + this.posYArray[a]) {
          if (this.id % 2 === turn) {
            return true;
          }
        }
      }
    }
    return false;
  }
  resetPosition() {
    this.curPosX = this.prevPosX;
    this.curPosY = this.prevPosY;
    this.prevPosX = this.holdX;
    this.prevPosY = this.holdY;
  }
  appendMove(x, y, cond) {
    let reqX, reqY;
    if (this.isGrabbed) {
      reqX = this.grabPosX;
      reqY = this.grabPosY;
    } else {
      reqX = this.prevPosX;
      reqY = this.prevPosY;
    }

    if (this.cb.isValid(reqX + x) &&
      this.cb.isValid(reqY + y)) {
      if (cond &&
        this.cb.isFilled(reqX + x, reqY + y) &&
        (this.id % 2) !== (this.cb.playGrid[reqX + x][reqY + y] % 2)) {
        this.posXArray.push(x);
        this.posYArray.push(y);
        this.attackArray.push(cond);
        return true;
      }
      if (false === cond &&
        false === this.cb.isFilled(reqX + x, reqY + y)) {
        this.posXArray.push(x);
        this.posYArray.push(y);
        this.attackArray.push(cond);
        return true;
      }
    }
    return !this.cb.isFilled(reqX + x, reqY + y);
  }
  checkAttackAndSelfDestruct(attacker) {
    if (this !== attacker && this.isAlive &&
      this.curPosX === attacker.curPosX &&
      this.curPosY === attacker.curPosY) {
      this.isAlive = false;
      return true;
    }
    return false;
  }
  update() {
    this.grabPosX = this.curPosX;
    this.grabPosY = this.curPosY;
  }
  shouldFlipTurn() {
    return (this.curPosX !== this.grabPosX ||
      this.curPosY !== this.grabPosY);
  }
}

export default Chesspiece