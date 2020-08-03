canvasSizeX = 560;
canvasSizeY = canvasSizeX;
black = 100;
white = 240;
gr = (0, 128, 0);

sizeX = canvasSizeX / 8;
sizeY = canvasSizeY / 8;

let bKi, bQu, wKi, wQu, bRo, wRo, bBi, wBi, bKn, wKn, bPa, wPa, cb;
function preload() {
  bKi = loadImage('images/bKi.png');
  bQu = loadImage('images/bQu.png');
  bBi = loadImage('images/bBi.png');
  bKn = loadImage('images/bKn.png');
  bRo = loadImage('images/bRo.png');
  bPa = loadImage('images/bPa.png');
  wKi = loadImage('images/wKi.png');
  wQu = loadImage('images/wQu.png');
  wBi = loadImage('images/wBi.png');
  wKn = loadImage('images/wKn.png');
  wRo = loadImage('images/wRo.png');
  wPa = loadImage('images/wPa.png');
}

class Chesspiece {
  constructor(initPosX, initPosY, pieceColor, cb) {
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
    var radius = (sizeX * 1.0 / 2);
    this.curPosX = round((mouseX - radius) * 1.0 / (sizeX));
    this.curPosY = round((mouseY - radius) * 1.0 / (sizeY));
  }
  checkAndReset() {
    if (this.curPosX < 0 || this.curPosX > cb.numSquares - 1 ||
      this.curPosY < 0 || this.curPosY > cb.numSquares - 1) {
      this.resetPosition();
    }
  }
  markPreviousPosition() {
    this.prevPosX = this.grabPosX;
    this.prevPosY = this.grabPosY;
  }
  grab() {
    this.grabPosX = this.curPosX;
    this.grabPosY = this.curPosY;
    this.isGrabbed = true;
  }
  isGrabbable() {
    if (this.isAlive) {
      var radius = (sizeX * 1.0 / 2);
      var centerX = this.curPosX * sizeX + radius;
      var centerY = this.curPosY * sizeY + radius;
      var d = dist(mouseX, mouseY, centerX, centerY);
      if (d < radius) {
        return true;
      }
    }
    return false;
  }
  markOnGrid() {
    // mark the current position
    cb.playGrid[this.curPosX][this.curPosY] = this.id;
    if (this.prevPosX !== this.curPosX || this.prevPosY !== this.curPosY) {
      // empty out the previous position
      cb.playGrid[this.prevPosX][this.prevPosY] = 0;
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
          if (this.id%2 == turn) {
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

    if (cb.isValid(reqX + x) &&
      cb.isValid(reqY + y)) {
      if (cond &&
        cb.isFilled(reqX + x, reqY + y) &&
        (this.id%2)!=(cb.playGrid[reqX + x][reqY + y]%2)) {
        this.posXArray.push(x);
        this.posYArray.push(y);
        this.attackArray.push(cond);
        return true;
      }
      if (false === cond &&
        false === cb.isFilled(reqX + x, reqY + y)) {
        this.posXArray.push(x);
        this.posYArray.push(y);
        this.attackArray.push(cond);
        return true;
      }
    }
    return false;
  }
  checkAttackAndSelfDestruct(attacker) {
    if (this != attacker &&
      this.curPosX == attacker.curPosX &&
      this.curPosY == attacker.curPosY) {
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
    return (this.curPosX != this.prevPosX ||
      this.curPosY != this.prevPosY);
  }
}

class Pawn extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor, cb) {
    super(initPosX, initPosY, pieceColor, cb);
    this.direction = (cb.numSquares - this.posY) < 4 ? -1 : 1;
    this.image = pieceColor ? bPa : wPa;
    this.id = this.pieceColor ? 1 : 2;
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
      this.appendMove(0, 2 * this.direction, false);
    } else {
      this.appendMove(0, this.direction, false);
    }
  }
  fetchPossibleAttackPositions() {
    this.appendMove(1, this.direction, true);
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
      if (this.curPosY == this.posY + (cb.numSquares - 2)*this.direction) {
        this.needsPromotion = true;
      }
    }
  }
}

class Rook extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor, cb) {
    super(initPosX, initPosY, pieceColor, cb);
    this.image = pieceColor ? bRo : wRo;
    this.id = this.pieceColor ? 3 : 4;
    this.markOnGrid();
    this.update();
  }
  fetchPossiblePositions() {
    var isVacant;
    for (var i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(0, i, false);
      if (isVacant === false) {
        this.appendMove(0, i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(0, -i, false);
      if (isVacant === false) {
        this.appendMove(0, -i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(i, 0, false);
      if (isVacant === false) {
        this.appendMove(0, i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(-i, 0, false);
      if (isVacant === false) {
        this.appendMove(0, -i, true);
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

class Bishop extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor) {
    super(initPosX, initPosY, pieceColor);
    this.image = pieceColor ? bBi : wBi;
    this.id = this.pieceColor ? 5 : 6;
    this.markOnGrid();
    this.update();
  }
  fetchPossiblePositions() {
    var isVacant;
    for (var i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(i, i, false);
      if (isVacant === false) {
        this.appendMove(i, i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(-i, -i, false);
      if (isVacant === false) {
        this.appendMove(-i, -i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(-i, i, false);
      if (isVacant === false) {
        this.appendMove(-i, i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
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

class Knight extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor, cb) {
    super(initPosX, initPosY, pieceColor, cb);
    this.image = pieceColor ? bKn : wKn;
    this.id = this.pieceColor ? 7 : 8;
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

class Queen extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor, cb) {
    super(initPosX, initPosY, pieceColor, cb);
    this.image = pieceColor ? bQu : wQu;
    this.id = this.pieceColor ? 9 : 10;
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
    for (var i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(0, i, false);
      if (isVacant === false) {
        this.appendMove(0, i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(0, -i, false);
      if (isVacant === false) {
        this.appendMove(0, -i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(i, 0, false);
      if (isVacant === false) {
        this.appendMove(i, 0, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(-i, 0, false);
      if (isVacant === false) {
        this.appendMove(-i, 0, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(i, i, false);
      if (isVacant === false) {
        this.appendMove(i, i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(-i, -i, false);
      if (isVacant === false) {
        this.appendMove(-i, -i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
      isVacant = this.appendMove(-i, i, false);
      if (isVacant === false) {
        this.appendMove(-i, i, true);
        break;
      }
    }
    for (i = 1; i < cb.numSquares; i++) {
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

class King extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor, cb) {
    super(initPosX, initPosY, pieceColor, cb);
    this.image = pieceColor ? bKi : wKi;
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

class ChessBoard {
  constructor() {
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
        x = new Queen(pawn.curPosX, pawn.curPosY, pawn.pieceColor);
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
        x = new Queen(pawn.curPosX, pawn.curPosY, pawn.pieceColor);
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
    return this.turn == piece.id%2;
  }
  isValid(x) {
    return (0 <= x && x <= cb.numSquares);
  }
  isFilled(x, y) {
    if (this.isValid(x) &&
      this.isValid(y) &&
      this.playGrid &&
      this.playGrid[x] &&
      this.playGrid[x][y] != 0) {
      return true;
    }
    return false;
  }
}

function setup() {
  createCanvas(canvasSizeX, canvasSizeY);
  cb = new ChessBoard();
  cb.init();
}

function windowResized() {
  resizeCanvas(canvasSizeX, canvasSizeY);
}

function draw() {
  drawGame();
}

function mousePressed() {
  if (cb.grabbed != true) {
    for (var piece of cb.allChesspieces) {
      if (piece.isGrabbable()) {
        cb.grabbed = true;
        cb.grabbedPiece = piece;
        if (cb.grabbedPiece.isGrabbed != true) {
          cb.grabbedPiece.grab();
          cb.grabbedPiece.update();
          break;
        }
      }
    }
  }
}

function mouseReleased() {
  if (cb.grabbed && cb.grabbedPiece) {
    cb.grabbedPiece.markPreviousPosition();
    if (false === cb.grabbedPiece.validateMove(cb.turn)) {
      cb.grabbedPiece.resetPosition();
    } else {
      // notify the occupant if any
      cb.notifyAttackFromGrabbedPiece();
      // transition
      cb.grabbedPiece.markOnGrid();
    }
  }
  var shouldFlipTurn = cb.grabbedPiece && cb.grabbedPiece.shouldFlipTurn();
  if (shouldFlipTurn) {
    cb.flipTurn();
  }
  cb.grabbed = false;
  cb.grabbedPiece.isGrabbed = false;
  cb.grabbedPiece.update();
  // update for promotions, if any
  cb.update();
  cb.grabbedPiece = null;
}

function mouseDragged() {
  if (cb.grabbed && cb.grabbedPiece) {
    cb.grabbedPiece.updateCurrentPosition();
    cb.grabbedPiece.checkAndReset();
  }
}

function drawChessBoard() {
  for (y = 0; y < cb.numSquares; y += 1) {
    for (x = 0; x < cb.numSquares; x += 1) {
      // Always put white on the right when arranging
      if ((x + y) % 2 == 0) {
        fill(white);
      } else {
        fill(black);
      }

      positionX = x * sizeX;
      positionY = y * sizeY;

      rect(positionX, positionY, sizeX, sizeY);
    }
  }
}

function drawPossiblePositions() {
  /*
   * I'd like to avoid any foul play in future
   * regarding cb.grabbedPiece, so additional checks.
   */
  if (cb.grabbed && cb.grabbedPiece && cb.isTurn(cb.grabbedPiece)) {
    for (var a = 0; a < cb.grabbedPiece.posXArray.length; a++) {
      /*
       * I thought of storing these things but considering it's a
       * one time job and that browser memory is precious, I vetoed
       * against it. I can take browser render time but not memory.
       */
      positionX = (cb.grabbedPiece.grabPosX + cb.grabbedPiece.posXArray[a])*sizeX;
      positionY = (cb.grabbedPiece.grabPosY + cb.grabbedPiece.posYArray[a])*sizeY;
      if (cb.grabbedPiece.attackArray[a]) {
        fill(128, 0, 0);
      } else {
        fill(0, 128, 0);
      }
      rect(positionX, positionY, sizeX, sizeY);
    }
  }
}

function drawPieces() {
  for (var cp of cb.allChesspieces) {
    if (cp.isAlive) {
      image(cp.image, cp.curPosX * sizeX, cp.curPosY * sizeY, 60, 60);
    }
  }
}

// Function just for drawing the board
function drawGame() {
  // Paint in order of Z axis inward out.
  drawChessBoard();
  drawPossiblePositions();
  drawPieces();
}
