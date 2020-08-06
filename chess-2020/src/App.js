import React, { Component } from 'react';
import './App.css';
import p5 from 'p5';

import ChessBoard from './models/ChessBoard'
import * as Constants from './models/Parameters';


let cb, bKi, bQu, wKi, wQu, bRo, wRo, bBi, wBi, bKn, wKn, bPa, wPa;
var n1, c1, pos1, n2, c2, pos2;

function logAction(msg, piece, action) {
  if (piece) {
    var x = "ABCDEFGH";
    var y = "12345678";
    if (action === 'p') {
      n1 = piece.constructor.name;
      c1 = piece.pieceColor ? "BLACK" : "WHITE";
      pos1 = x[piece.curPosX] + y[piece.curPosY];
      console.log(msg, pos1)
    } else if (action === 'r') {
      n2 = piece.constructor.name;
      c2 = piece.pieceColor ? "BLACK" : "WHITE";
      pos2 = x[piece.curPosX] + y[piece.curPosY];
      if (n1 === n2 && c1 === c2 && pos1 !== pos2) {
        console.log(msg, n1, c1, pos1, pos2);
      }
      n1 = null;
      n2 = null;
      c1 = null;
      c2 = null;
      pos1 = null;
      pos2 = null;
    }
  }
}

export default class App extends Component {
  constructor() {
    console.log("Started.")
    super()
    this.game = new p5(p => {
      p.setup = function () {
        p.createCanvas(Constants.canvasSizeX, Constants.canvasSizeY).parent('chessboard')
        cb = new ChessBoard(p)
        cb.init()
        console.log("Done with Setup")
      }

      p.draw = function () {
        p.drawGame();
      }

      p.preload = function () {
        bKi = p.loadImage(require('./images/bKi.png'));
        bQu = p.loadImage(require('./images/bQu.png'));
        bBi = p.loadImage(require('./images/bBi.png'));
        bKn = p.loadImage(require('./images/bKn.png'));
        bRo = p.loadImage(require('./images/bRo.png'));
        bPa = p.loadImage(require('./images/bPa.png'));
        wKi = p.loadImage(require('./images/wKi.png'));
        wQu = p.loadImage(require('./images/wQu.png'));
        wBi = p.loadImage(require('./images/wBi.png'));
        wKn = p.loadImage(require('./images/wKn.png'));
        wRo = p.loadImage(require('./images/wRo.png'));
        wPa = p.loadImage(require('./images/wPa.png'));
      }

      p.mousePressed = function () {
        console.group("Move");
        if (cb.grabbed !== true) {
          for (var piece of cb.allChesspieces) {
            if (piece.isGrabbable()) {
              cb.grabbed = true;
              cb.grabbedPiece = piece;
              logAction('Pick : ', cb.grabbedPiece, 'p');
              if (cb.grabbedPiece.isGrabbed !== true) {
                cb.grabbedPiece.grab();
                cb.grabbedPiece.update();
                break;
              }
            }
          }
        }
      }

      p.mouseReleased = function () {
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
          var shouldFlipTurn = cb.grabbedPiece && cb.grabbedPiece.shouldFlipTurn();
          if (shouldFlipTurn) {
            cb.flipTurn();
          }
          logAction('Move : ', cb.grabbedPiece, 'r');
          console.groupEnd("Move");
          cb.grabbed = false;
          cb.grabbedPiece.isGrabbed = false;
          cb.grabbedPiece.update();
          // update for promotions, if any
          cb.update();
          cb.grabbedPiece = null;
        }
      }

      p.mouseDragged = function () {
        if (cb.grabbed && cb.grabbedPiece) {
          cb.grabbedPiece.updateCurrentPosition();
          cb.grabbedPiece.checkAndReset();
        }
      }

      p.drawChessBoard = function () {
        p.clear()

        for (var y = 0; y < Constants.numSquares; y += 1) {
          for (var x = 0; x < Constants.numSquares; x += 1) {
            // Always put Constants.white on the right when arranging
            if ((x + y) % 2 === 0) {
              p.fill(Constants.white);
            } else {
              p.fill(Constants.black);
            }
            let positionX = x * Constants.sizeX + Constants.drawOffsetX;
            let positionY = y * Constants.sizeY + Constants.drawOffsetY;
            p.rect(positionX, positionY, Constants.sizeX, Constants.sizeY);
          }
        }

        p.textSize(15);
        p.fill(Constants.red)
        for (let x = 1; x <= Constants.numSquares; x++) {
          let dx = x * Constants.sizeX;
          let dy = x * Constants.sizeY;
          p.text(Constants.titleX[x - 1], dx, 2 * Constants.drawOffsetX / 5)
          p.text(Constants.titleX[x - 1], dx, Constants.canvasSizeY - 2 * Constants.drawOffsetY / 5)
          p.text(Constants.titleY[x - 1], 2 * Constants.drawOffsetY / 5, dy)
          p.text(Constants.titleY[x - 1], Constants.canvasSizeX - 2 * Constants.drawOffsetX / 5, dy)
        }
      }

      p.drawPossiblePositions = function () {
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
            let positionX = (cb.grabbedPiece.grabPosX + cb.grabbedPiece.posXArray[a]) * Constants.sizeX + Constants.drawOffsetX;
            let positionY = (cb.grabbedPiece.grabPosY + cb.grabbedPiece.posYArray[a]) * Constants.sizeY + Constants.drawOffsetY;
            if (cb.grabbedPiece.attackArray[a]) {
              p.fill(128, 0, 0);
            } else {
              p.fill(0, 128, 0);
            }
            p.rect(positionX, positionY, Constants.sizeX, Constants.sizeY);
          }
        }
      }

      p.getImage = function (cp) {
        var type = cp.constructor.name
        var color = cp.pieceColor
        switch (type) {
          case 'Pawn':
            return color ? bPa : wPa;
          case 'Rook':
            return color ? bRo : wRo;
          case 'Bishop':
            return color ? bBi : wBi;
          case 'Knight':
            return color ? bKn : wKn;
          case 'Queen':
            return color ? bQu : wQu;
          case 'King':
            return color ? bKi : wKi;
          default:
            return null;
        }
      }

      p.drawPieces = function () {

        for (var cp of cb.allChesspieces) {
          if (cp.isAlive && !cb.isTurn(cp)) {
            p.image(p.getImage(cp), cp.curPosX * Constants.sizeX + Constants.drawOffsetX, cp.curPosY * Constants.sizeY + Constants.drawOffsetY, 60, 60);
          }
        }
        for (cp of cb.allChesspieces) {
          if (cp.isAlive && cb.isTurn(cp)) {
            p.image(p.getImage(cp), cp.curPosX * Constants.sizeY + Constants.drawOffsetX, cp.curPosY * Constants.sizeY + Constants.drawOffsetY, 60, 60);
          }
        }
      }

      // Function just for drawing the board
      p.drawGame = function () {
        // Paint in order of Z axis inward out.
        p.drawChessBoard();
        p.drawPossiblePositions();
        p.drawPieces();
      }



    })

    this.lostPieces = new p5(p => {
      p.getImage = function (cp) {
        var type = cp.constructor.name
        var color = cp.pieceColor
        switch (type) {
          case 'Pawn':
            return color ? bPa : wPa;
          case 'Rook':
            return color ? bRo : wRo;
          case 'Bishop':
            return color ? bBi : wBi;
          case 'Knight':
            return color ? bKn : wKn;
          case 'Queen':
            return color ? bQu : wQu;
          case 'King':
            return color ? bKi : wKi;
          default:
            return null;
        }
      }
      p.setup = function () {
        p.createCanvas(Constants.lostCanvasSizeX, Constants.lostCanvasSizeY).parent('lostpieces')
      }
      p.draw = function () {
        //ToDo : Refactor
        p.clear()
        for (var i = 0; i < Constants.numSquares; i++) {
          for (var j = 0; j < 4; j++) {
            if ((i + j) % 2 === 0) {
              p.fill(0, 128, 0);
            } else {
              p.fill(0, 0, 128);
            }
            p.rect(i * 70, j * 70, i * 70 + 70, j * 70 + 70)
          }
        }
        if (cb && cb.allChesspieces) {
          var deadPieces = cb.allChesspieces.filter((x) => !x.isAlive && !x.needsPromotion);
          for (i = 0; i < Constants.numSquares; i++) {
            for (j = 0; j < 4; j++) {
              if (i * 8 + j < deadPieces.length) {
                var cp = deadPieces[i * 8 + j]
                if (cp) {
                  p.image(p.getImage(cp), i * Constants.sizeX, j * Constants.sizeY, 60, 60);
                }
              }
            }
          }
        }
      }
    })
  }
  render() {
    return (
      <div className="App">
        <div id='chessboard' style={({ margin: '25px', float: 'left' })}>

        </div>
        <div id='lostpieces' style={({ margin: (25 + Constants.drawOffsetX) + 'px', float: 'left' })}>

        </div>
      </div>
    );
  }
}

