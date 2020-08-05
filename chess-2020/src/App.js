import React, { Component } from 'react';
import './App.css';
import p5 from 'p5';

import ChessBoard from './models/ChessBoard'
import * as Constants from './models/Parameters';


let cb,bKi, bQu, wKi, wQu, bRo, wRo, bBi, wBi, bKn, wKn, bPa, wPa;

export default class App extends Component {
  constructor() {
    console.log("Started.")
    super()
    this.sketch = new p5( p => {
      p.setup = function() {
        p.createCanvas(Constants.canvasSizeX, Constants.canvasSizeY)
        cb = new ChessBoard(p)
        cb.init()
        console.log("Done with Setup")
      }

      p.draw = function() {
        p.drawGame();
      }

      p.preload = function() {
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

      p.mousePressed = function() {
        console.log('Mouse pressed.',cb);
        if (cb.grabbed !== true) {
          for (var piece of cb.allChesspieces) {
            if (piece.isGrabbable()) {
              cb.grabbed = true;
              cb.grabbedPiece = piece;
              if (cb.grabbedPiece.isGrabbed !== true) {
                cb.grabbedPiece.grab();
                cb.grabbedPiece.update();
                break;
              }
            }
          }
        }
      }
      
      p.mouseReleased = function() {
        console.log('Mouse released.',cb);
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
        cb.grabbed = false;
        cb.grabbedPiece.isGrabbed = false;
        cb.grabbedPiece.update();
        // update for promotions, if any
        cb.update();
        cb.grabbedPiece = null;
      }
      }
      
      p.mouseDragged= function() {
        if (cb.grabbed && cb.grabbedPiece) {
          cb.grabbedPiece.updateCurrentPosition();
          cb.grabbedPiece.checkAndReset();
        }
      }

      p.drawChessBoard = function() {
        for (var y = 0; y < cb.numSquares; y += 1) {
          for (var x = 0; x < cb.numSquares; x += 1) {
            // Always put Constants.white on the right when arranging
            if ((x + y) % 2 === 0) {
              p.fill(Constants.white);
            } else {
              p.fill(Constants.black);
            }
            let positionX = x * Constants.sizeX;
            let positionY = y * Constants.sizeY;
            p.rect(positionX, positionY, Constants.sizeX, Constants.sizeY);
          }
        }
      }
      
      p.drawPossiblePositions = function() {
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
            let positionX = (cb.grabbedPiece.grabPosX + cb.grabbedPiece.posXArray[a])*Constants.sizeX;
            let positionY = (cb.grabbedPiece.grabPosY + cb.grabbedPiece.posYArray[a])*Constants.sizeY;
            if (cb.grabbedPiece.attackArray[a]) {
              p.fill(128, 0, 0);
            } else {
              p.fill(0, 128, 0);
            }
            p.rect(positionX, positionY, Constants.sizeX, Constants.sizeY);
          }
        }
      }
      
      p.getImage = function(cp) {
        var type = cp.constructor.name
        var color = cp.pieceColor
        switch(type) {
          case 'Pawn':
            return color?bPa:wPa;
          case 'Rook':
            return color?bRo:wRo;
          case 'Bishop':
            return color?bBi:wBi;
          case 'Knight':
            return color?bKn:wKn;
          case 'Queen':
            return color?bQu:wQu;
          case 'King':
            return color?bKi:wKi;
          default:
            return null;
        }
      }
      
      p.drawPieces = function() {
        for (var cp of cb.allChesspieces) {
          if (cp.isAlive) {
            p.image(p.getImage(cp), cp.curPosX * Constants.sizeX, cp.curPosY * Constants.sizeY, 60, 60);
          }
        }
      }
      
      // Function just for drawing the board
      p.drawGame = function() {
        // Paint in order of Z axis inward out.
        p.drawChessBoard();
        p.drawPossiblePositions();
        p.drawPieces();
      }
      
      
      
    })
  }
  render() {
    return (
      <div className="App">
        <div id='rendertarget'>
      </div>
      </div>
    );
  }
}

