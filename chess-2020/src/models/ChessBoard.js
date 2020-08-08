import Bishop from '././Bishop'
import Rook from './Rook'
import Knight from './Knight'
import King from './King'
import Queen from './Queen'
import Pawn from './Pawn'
import * as Constants from './Parameters'

class ChessBoard {
  constructor(p) {
    this.sketch = p;
    this.numSquares = 8;
    this.playGrid = Array(this.numSquares).fill().map(() => Array(this.numSquares).fill(0));
    this.allChesspieces = []
    this.check = null;
    this.checkCount = 0;
    this.isCheckMate = null;
  }
  init() {
    console.log('init called')
    this.allChesspieces = [];
    /*
     * This order is irrelevant for move decisions as ideally
     * the moves need to be shuffled before evaluated for
     * performance reasons. The search should have conditions
     * accordingly
     */

    // Push white pawns and black pawns
    for (var i = 0; i < Constants.numSquares; i++) {
      this.allChesspieces.push(new Pawn(i, 1, Constants.BLACKPIECE, this));
    }
    for (let i = 0; i < Constants.numSquares; i++) {
      this.allChesspieces.push(new Pawn(i, 6, Constants.WHITEPIECE, this));
    }

    // Push the Rooks
    this.allChesspieces.push(new Rook(0, 0, Constants.BLACKPIECE, this));
    this.allChesspieces.push(new Rook(7, 0, Constants.BLACKPIECE, this));
    this.allChesspieces.push(new Rook(0, 7, Constants.WHITEPIECE, this));
    this.allChesspieces.push(new Rook(7, 7, Constants.WHITEPIECE, this));

    // Push the Knights
    this.allChesspieces.push(new Knight(1, 0, Constants.BLACKPIECE, this));
    this.allChesspieces.push(new Knight(6, 0, Constants.BLACKPIECE, this));
    this.allChesspieces.push(new Knight(1, 7, Constants.WHITEPIECE, this));
    this.allChesspieces.push(new Knight(6, 7, Constants.WHITEPIECE, this));

    // Push the Bishops
    this.allChesspieces.push(new Bishop(2, 0, Constants.BLACKPIECE, this));
    this.allChesspieces.push(new Bishop(5, 0, Constants.BLACKPIECE, this));
    this.allChesspieces.push(new Bishop(2, 7, Constants.WHITEPIECE, this));
    this.allChesspieces.push(new Bishop(5, 7, Constants.WHITEPIECE, this));

    // Push the Queens
    this.allChesspieces.push(new Queen(3, 0, Constants.BLACKPIECE, this))
    this.allChesspieces.push(new Queen(3, 7, Constants.WHITEPIECE, this))

    // Push the Kings
    this.allChesspieces.push(new King(4, 0, Constants.BLACKPIECE, this))
    this.allChesspieces.push(new King(4, 7, Constants.WHITEPIECE, this))

    this.grabbed = null;
    this.grabbedPiece = null;
    this.turn = Constants.WHITEPIECE;
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
  checkAndPromotePawn() {
    let pawn, x;
    let pawns = this.allChesspieces.filter((x) => x.constructor.name === 'Pawn');
    for (pawn of pawns) {
      if (pawn.isAlive && pawn.needsPromotion) {
        pawn.isAlive = false;
        x = new Queen(pawn.curPosX, pawn.curPosY, pawn.pieceColor, this);
        this.allChesspieces.push(x);
        break;
      }
    }
  }
  update() {
    this.checkAndPromotePawn()
    this.updateChecks()
    //this.updateFEN()
  }
  getKingPosition(color) {
    return this.allChesspieces.filter((x) => x.constructor.name === 'King' && x.pieceColor === color)
      .map((y) => [y.curPosX, y.curPosY])[0]
  }
  // There has to be a better way to implement this.
  getAllAttackPositions(color) {
    let allAttackPositions = []
    //for all chesspieces
    for (var i = 0; i < this.allChesspieces.length; i++) {
      var piece = this.allChesspieces[i]
      if (piece.pieceColor === color) {
        piece.update()
        let attacks = piece.fetchAttackPositions()
        for (var j = 0; j < attacks["x"].length; j++) {
          allAttackPositions.push([piece.curPosX, piece.curPosY, attacks["x"][j], attacks["y"][j], piece.constructor.name])
        }
      }
    }
    return allAttackPositions
  }

  // There has to be a better way to implement this.
  getAllNextPositions(color) {
    let allNextPositions = []
    //for all chesspieces
    for (var i = 0; i < this.allChesspieces.length; i++) {
      var piece = this.allChesspieces[i]
      if (piece.pieceColor === color) {
        piece.update()
        let blocks = piece.fetchNextPositions()
        for (var j = 0; j < blocks["x"].length; j++) {
          allNextPositions.push([piece.curPosX, piece.curPosY, blocks["x"][j], blocks["y"][j], piece.constructor.name])
        }
      }
    }
    return allNextPositions;
  }

  updateChecks() {
    console.group("Check for White King")
    this.check = null;
    this.checkCount = 0;
    let attackingPieces = []

    // update check for white king
    let wk = this.getKingPosition(Constants.WHITEPIECE)
    console.log("White King : ", wk)
    let attackers = this.getAllAttackPositions(Constants.BLACKPIECE)
    console.log("Attackers : ", attackers)
    for (let i = 0; i < attackers.length; i++) {
      if (attackers[i][2] === wk[0] && attackers[i][3] === wk[1]) {
        this.check = Constants.WHITEPIECE
        this.checkCount++;
        attackingPieces.push(attackers[i])
      }
    }
    if (this.check !== null) {
      if (this.updateCheckMates(Constants.WHITEPIECE, attackingPieces)) {
        this.isCheckMate = Constants.WHITEPIECE
        console.log("CheckMate!", this.isCheckMate ? "BLACK" : "WHITE")

      } else {
        //We found the check
      }
      console.groupEnd("Check for White King")
      return
    }
    console.groupEnd("Check for White King")
    console.group("Check for Black King")
    this.check = null;
    this.checkCount = 0;
    attackingPieces = []

    // update check for black king
    let bk = this.getKingPosition(Constants.BLACKPIECE)
    console.log("Black King : ", wk)
    attackers = this.getAllAttackPositions(Constants.WHITEPIECE)
    console.log("Attackers : ", attackers)
    for (let i = 0; i < attackers.length; i++) {
      if (attackers[i][2] === bk[0] && attackers[i][3] === bk[1]) {
        this.check = Constants.BLACKPIECE
        this.checkCount++;
        attackingPieces.push(attackers[i])
      }
    }

    if (this.check !== null) {
      if (this.updateCheckMates(Constants.WHITEPIECE, attackingPieces)) {
        this.isCheckMate = Constants.WHITEPIECE
        console.log("CheckMate!", this.isCheckMate ? "BLACK" : "WHITE")
      } else {
        //We found the check
      }
      console.groupEnd("Check for Black King")
      return
    }
    console.groupEnd("Check for Black King")
  }

  updateCheckMates(color, attackers) {
    let isCheckMate = null;
    // get King's next moves (both attack and general moves)
    let king = this.allChesspieces.filter((x) => x.constructor.name === 'King' && x.pieceColor === color)[0]
    let kingMoves = king.fetchNextPositions()
    console.log("King :", king, "KingMoves : ", kingMoves, "Color :", color, "Attackers : ", attackers)

    // Double Check
    if (this.checkCount >= 2) {

      let isCheckMate = null;

      // For both Single and Double checks
      // Check if King can capture any attacking piece
      for (let i = 0; i < attackers.length; i++) {
        for (let j = 0; j < kingMoves["x"].length; j++) {
          if (kingMoves["x"][j] === attackers[i][0] &&
            kingMoves["y"][j] === attackers[i][1]) {
            isCheckMate = false;
          }
        }
      }

      if (isCheckMate === false) {
        console.log("King can capture the checker. Count = 2")
        return false;
      }

      isCheckMate = null;

      /*
       * Check if King has any (attacking or non attacking) moves
       * which are currently NOT under attack.
       * These moves may come into attack just after taken.
       */
      for (let i = 0; i < kingMoves["x"].length; i++) {
        for (let j = 0; j < attackers.length; j++) {
          if (kingMoves["x"][j] !== attackers[i][2] &&
            kingMoves["y"][j] !== attackers[i][3]) {
            isCheckMate = true;
          }
        }
      }

      if (isCheckMate === null) {
        console.log("King can escape. Count = 2")
        return false;
      }

      /*
       * For the love of God, someone please capture the piece
       * Long Live the King!
       */
      let defensePositions = this.getAllAttackPositions(king.pieceColor)
      console.log("Defense : ", defensePositions, "Attacker :", attackers)
      for (let i = 0; i < defensePositions.length; i++) {
        for (let j = 0; j < attackers.length; j++) {
          if (defensePositions[i][2] === attackers[j][0] &&
              defensePositions[i][3] === attackers[j][1]) {
            return false;
          }
        }
      }

      //Someone's screwed
      return true

    } else if (this.checkCount === 1) {

      isCheckMate = null;
      let attacker = attackers.map((x) => x[2] === king.curPosX && x[3] === king.curPosY)[0]

      /*
       * For the love of God, someone please capture the piece
       * Long Live the King!
       */
      let defensePositions = this.getAllAttackPositions(king.pieceColor)
      console.log("Defense : ", defensePositions, "Attacker :", attacker)
      for (let i = 0; i < defensePositions.length; i++) {
        if (defensePositions[i][2] === attacker[0] && defensePositions[i][3] === attacker[1]) {
          return false;
        }
      }

      // For both Single and Double checks
      // Check if King can capture any attacking piece
      for (let j = 0; j < kingMoves["x"].length; j++) {
        if (kingMoves["x"][j] === attacker[0] &&
          kingMoves["y"][j] === attacker[1]) {
          isCheckMate = false;
        }
      }


      if (isCheckMate === false) {
        return false;
      }

      /*
       * Check if King has any (attacking or non attacking) moves
       * which are currently NOT under attack.
       * These moves may come into attack just after taken.
       */
      for (let i = 0; i < kingMoves["x"].length; i++) {
        if (kingMoves["x"][i] !== attacker[2] &&
          kingMoves["y"][i] !== attacker[3]) {
          isCheckMate = true;
        }
      }

      if (isCheckMate === null) {
        return false;
      }

      /*
       * Hope the checkmate is from Queen or Rook.
       * Let's call it QR attacker. In this case, it's enough
       * if there can be another piece in between for blocking.
       */

      let blockablePositions = []
      let dx = this.signum(attacker[0] - king.curPosX)
      let dy = this.signum(attacker[1] - king.curPosY)

      // I mean, no one kills King, except me of course
      for (let u = king.curPosX + dx, v = king.curPosY + dy;
        u !== attacker[0] && v !== attacker[1];
        u = u + dx, v = v + dy) {
        blockablePositions.push([u, v])
      }

      let blockingPositions = this.getAllNextPositions(king.pieceColor).map((x) => [x[2], x[3]])

      console.log("Blockable : ", blockablePositions, "Blocking : ", blockingPositions)

      for (let i = 0; i < blockablePositions.length; i++) {
        for (let j = 0; j < blockingPositions.length; j++) {
          if (blockablePositions[i][0] === blockingPositions[j][0] &&
            blockablePositions[i][1] === blockingPositions[j][1]) {
            return false;
          }
        }
      }

      return true;
    }

  }

  signum(value) {
    if (value === 0) {
      return 0;
    } else {
      return (value > 0 ? 1 : -1);
    }
  }
  updateFEN() {

  }

  flipTurn() {
    if (this.turn === Constants.BLACKPIECE) {
      this.turn = Constants.WHITEPIECE;
    } else if (this.turn === Constants.WHITEPIECE) {
      this.turn = Constants.BLACKPIECE;
    }
  }
  isTurn(piece) {
    return this.turn === piece.pieceColor;
  }
  isValid(x) {
    return (0 <= x && x < this.numSquares);
  }
  isFilled(x, y) {
    if (this.isValid(x) &&
      this.isValid(y) &&
      this.playGrid &&
      this.playGrid[x] &&
      this.playGrid[x][y] !== 0) {
      return true;
    }
    return false;
  }
}

export default ChessBoard;