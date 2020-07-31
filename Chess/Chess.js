canvasSizeX = 560;
canvasSizeY = canvasSizeX;
numSquares = 8;
playGrid = Array(numSquares).fill().map(() => Array(numSquares).fill(0));
black = 100;
white = 240;
gr = (0,128,0);

sizeX = canvasSizeX / numSquares;
sizeY = canvasSizeY / numSquares;

function isValid(x) {
  return (0 <= x && x <= numSquares);
}

function isFilled(x, y) {
  if(isValid(x) &&
     isValid(y) &&
     playGrid &&
     playGrid[x] &&
     playGrid[x][y] != 0){
            return true;
    }
  return false;
}

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
  constructor(initPosX, initPosY, pieceColor) {
    this.posX = initPosX;
    this.posY = initPosY;
    this.pieceColor = pieceColor;
    this.currentPosX = this.posX;
    this.currentPosY = this.posY;
    this.posXArray = [];
    this.posYArray = [];
    this.attackArray = [];
    this.grabbed = false;
  }
  clearPossiblePositions() {
    this.posXArray = [];
    this.posYArray = [];
  }
  appendMove(x, y, cond) {
    let reqX, reqY, isAttack;
    if (this.isGrabbed) {
      reqX = this.prevPosX;
      reqY = this.prevPosY;
    } else {
      reqX = this.currentPosX;
      reqY = this.currentPosY;
    }
    isAttack = (cond == isFilled(reqX + x,
                                 reqY + y));
    if (isValid(reqX + x) &&
        isValid(reqY + y) &&
        isAttack) {
      this.posXArray.push(x);
      this.posYArray.push(y);
      this.attackArray.push(cond);
      return true;
    }
    return false;
  }
}

class Pawn extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor) {
    super(initPosX, initPosY, pieceColor);
    this.direction = (numSquares - this.posY) < 4 ? -1 : 1;
    this.image = pieceColor ? bPa : wPa;
    this.clearPossiblePositions();
    this.fetchPossiblePositions();
    playGrid[this.posX][this.posY] = 1;
  }
  fetchPossibleMovePositions() {
    let reqY;
    if (this.isGrabbed) {
      reqY = this.prevPosY;
    } else {
      reqY = this.currentPosY;
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
}

class Rook extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor) {
    super(initPosX, initPosY, pieceColor);
    this.image = pieceColor ? bRo : wRo;
    this.clearPossiblePositions();
    this.fetchPossiblePositions();
    playGrid[this.posX][this.posY] = 3;
  }
  fetchPossiblePositions() {
    var isVacant;
    for (var i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(0, i, false);
      if (isVacant === false) {
        this.appendMove(0, i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(0, -i, false);
      if (isVacant === false) {
        this.appendMove(0, -i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(i, 0, false);
      if (isVacant === false) {
        this.appendMove(0, i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(-i, 0, false);
      if (isVacant === false) {
        this.appendMove(0, -i, true);
        break;
      }
    }
  }
}

class Bishop extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor) {
    super(initPosX, initPosY, pieceColor);
    this.image = pieceColor ? bBi : wBi;
    this.clearPossiblePositions();
    this.fetchPossiblePositions();
    playGrid[this.posX][this.posY] = 5;
  }
  fetchPossiblePositions() {
    var isVacant;
    for (var i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(i, i, false);
      if (isVacant === false) {
        this.appendMove(i, i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(-i, -i, false);
      if (isVacant === false) {
        this.appendMove(-i, -i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(-i, i, false);
      if (isVacant === false) {
        this.appendMove(-i, i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(i, -i, false);
      if (isVacant === false) {
        this.appendMove(i, -i, true);
        break;
      }
    }
  }
}

class Knight extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor) {
    super(initPosX, initPosY, pieceColor);
    this.image = pieceColor ? bKn : wKn;
    this.clearPossiblePositions();
    this.fetchPossiblePositions();
    playGrid[this.posX][this.posY] = 9;
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
}

class Queen extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor) {
    super(initPosX, initPosY, pieceColor);
    this.image = pieceColor ? bQu : wQu;
    this.clearPossiblePositions();
    this.fetchPossiblePositions();
    playGrid[this.posX][this.posY] = 11;
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
    for (var i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(0, i, false);
      if (isVacant === false) {
        this.appendMove(0, i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(0, -i, false);
      if (isVacant === false) {
        this.appendMove(0, -i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(i, 0, false);
      if (isVacant === false) {
        this.appendMove(i, 0, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(-i, 0, false);
      if (isVacant === false) {
        this.appendMove(-i, 0, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(i, i, false);
      if (isVacant === false) {
        this.appendMove(i, i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(-i, -i, false);
      if (isVacant === false) {
        this.appendMove(-i, -i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(-i, i, false);
      if (isVacant === false) {
        this.appendMove(-i, i, true);
        break;
      }
    }
    for (i = 1; i < numSquares; i++) {
      isVacant = this.appendMove(i, -i, false);
      if (isVacant === false) {
        this.appendMove(i, -i, true);
        break;
      }
    }
  }
}

class King extends Chesspiece {
  constructor(initPosX, initPosY, pieceColor) {
    super(initPosX, initPosY, pieceColor);
    this.image = pieceColor ? bKi : wKi;
    this.clearPossiblePositions();
    this.fetchPossiblePositions();
    playGrid[this.posX][this.posY] = 50;
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
}

class ChessBoard {
  constructor() {
    // 0 is for white and 1 for black
    this.myLeftRook = new Rook(0, 7, 0);
    this.myRightRook = new Rook(7, 7, 0);
    this.myleftKnight = new Knight(1, 7, 0);
    this.myRightKnight = new Knight(6, 7, 0);
    this.myLeftBishop = new Bishop(2, 7, 0);
    this.myRightBishop = new Bishop(5, 7, 0);
    this.myQueen = new Queen(3, 7, 0);
    this.myKing = new King(4, 7, 0);
    this.myPawns = [];
    for (var i = 0; i < 8; i++) {
      this.myPawns.push(new Pawn(i, 6, 0));
    }

    this.oppLeftRook = new Rook(0, 0, 1);
    this.oppRightRook = new Rook(7, 0, 1);
    this.oppleftKnight = new Knight(1, 0, 1);
    this.oppRightKnight = new Knight(6, 0, 1);
    this.oppLeftBishop = new Bishop(2, 0, 1);
    this.oppRightBishop = new Bishop(5, 0, 1);
    this.oppQueen = new Queen(3, 0, 1);
    this.oppKing = new King(4, 0, 1);
    this.oppPawns = [];
    for (i = 0; i < 8; i++) {
      this.oppPawns.push(new Pawn(i, 1, 1));
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
  }
}

function setup() {
  createCanvas(canvasSizeX, canvasSizeY);
  cb = new ChessBoard();
}

function windowResized() {
  resizeCanvas(canvasSizeX, canvasSizeY);
}

function draw() {
  drawBoard();
}

function mousePressed() {
  if (cb.grabbed != true) {
    for (var piece of cb.allChesspieces) {
      radius = (sizeX * 1.0 / 2);
      centerX = piece.currentPosX * sizeX + radius;
      centerY = piece.currentPosY * sizeY + radius;
      d = dist(mouseX, mouseY, centerX, centerY);
      if (d < radius) {
        cb.grabbed = true;
        cb.grabbedPiece = piece;
        if (cb.grabbedPiece.isGrabbed != true) {
          cb.grabbedPiece.prevPosX = cb.grabbedPiece.currentPosX;
          cb.grabbedPiece.prevPosY = cb.grabbedPiece.currentPosY;
        }
        cb.grabbedPiece.isGrabbed = true;
        break;
      }
    }
    print(cb.grabbedPiece,cb.grabbedPiece.posXArray,cb.grabbedPiece.posYArray);
  }
}

function mouseReleased() {
  cb.grabbed = false;
  cb.grabbedPiece.isGrabbed = false;
  cb.grabbedPiece = null;
}

function mouseDragged() {
  if (cb.grabbed) {
    cb.grabbedPiece.currentPosX = round((mouseX - radius) * 1.0 / (sizeX));
    cb.grabbedPiece.currentPosY = round((mouseY - radius) * 1.0 / (sizeY));
    if(cb.grabbedPiece.currentPosX < 0 || cb.grabbedPiece.currentPosX > 7 ||
       cb.grabbedPiece.currentPosY < 0 || cb.grabbedPiece.currentPosY > 7) {
         cb.grabbedPiece.currentPosX = cb.grabbedPiece.prevPosX;
         cb.grabbedPiece.currentPosY = cb.grabbedPiece.prevPosY;
       }
  }
}

// Function just for drawing the board
function drawBoard() {
  for (y = 0; y < numSquares; y += 1) {
    for (x = 0; x < numSquares; x += 1) {
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
  if (cb.grabbed) {
      cb.grabbedPiece.clearPossiblePositions();
      cb.grabbedPiece.fetchPossiblePositions();
    for (var a = 0; a < cb.grabbedPiece.posXArray.length; a ++) {
      positionX = (cb.grabbedPiece.prevPosX + cb.grabbedPiece.posXArray[a])*sizeX;
      positionY = (cb.grabbedPiece.prevPosY + cb.grabbedPiece.posYArray[a])*sizeY;
      if (cb.grabbedPiece.attackArray[a]) {
        fill(128,0,0);
      } else {
        fill(0,128,0);
      }
      rect(positionX, positionY, sizeX, sizeY);
      print(cb.grabbedPiece.prevPosX, cb.grabbedPiece.prevPosY, cb.grabbedPiece.posXArray[a], cb.grabbedPiece.posYArray[a], cb.grabbedPiece.attackArray[a]);
    }
  }
  
  for (var cp of cb.allChesspieces) {
    image(cp.image, cp.currentPosX * sizeX, cp.currentPosY * sizeY, 60, 60);
  }
}
