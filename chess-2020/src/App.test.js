import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import ChessBoard from './models/ChessBoard';
import * as Constants from './models/Parameters';

// Mock p5.js
jest.mock('p5', () => {
  return jest.fn().mockImplementation(() => {
    return {
      createCanvas: jest.fn().mockReturnValue({
        parent: jest.fn()
      }),
      loadImage: jest.fn(),
      clear: jest.fn(),
      fill: jest.fn(),
      rect: jest.fn(),
      text: jest.fn(),
      textSize: jest.fn(),
      image: jest.fn()
    };
  });
});

test('App component renders without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});

test('App component has chessboard div', () => {
  const { container } = render(<App />);
  const chessboardDiv = container.querySelector('#chessboard');
  expect(chessboardDiv).toBeTruthy();
});

test('App component has lostpieces div', () => {
  const { container } = render(<App />);
  const lostpiecesDiv = container.querySelector('#lostpieces');
  expect(lostpiecesDiv).toBeTruthy();
});

// Test ChessBoard model
test('ChessBoard initializes correctly', () => {
  const mockP5 = {
    createCanvas: jest.fn().mockReturnValue({
      parent: jest.fn()
    })
  };
  const board = new ChessBoard(mockP5);
  expect(board.numSquares).toBe(8);
  expect(board.playGrid).toBeDefined();
  expect(board.allChesspieces).toBeDefined();
});

test('ChessBoard init creates all pieces', () => {
  const mockP5 = {
    createCanvas: jest.fn().mockReturnValue({
      parent: jest.fn()
    })
  };
  const board = new ChessBoard(mockP5);
  board.init();
  expect(board.allChesspieces.length).toBeGreaterThan(0);
  expect(board.turn).toBe(Constants.WHITEPIECE);
});

test('ChessBoard flipTurn works correctly', () => {
  const mockP5 = {
    createCanvas: jest.fn().mockReturnValue({
      parent: jest.fn()
    })
  };
  const board = new ChessBoard(mockP5);
  board.init();
  const initialTurn = board.turn;
  board.flipTurn();
  expect(board.turn).not.toBe(initialTurn);
  board.flipTurn();
  expect(board.turn).toBe(initialTurn);
});

test('ChessBoard isValid works correctly', () => {
  const mockP5 = {
    createCanvas: jest.fn().mockReturnValue({
      parent: jest.fn()
    })
  };
  const board = new ChessBoard(mockP5);
  expect(board.isValid(0)).toBe(true);
  expect(board.isValid(7)).toBe(true);
  expect(board.isValid(8)).toBe(false);
  expect(board.isValid(-1)).toBe(false);
});

test('ChessBoard updateFEN generates FEN string', () => {
  const mockP5 = {
    createCanvas: jest.fn().mockReturnValue({
      parent: jest.fn()
    })
  };
  const board = new ChessBoard(mockP5);
  board.init();
  const fen = board.updateFEN();
  expect(typeof fen).toBe('string');
  expect(fen.length).toBeGreaterThan(0);
  expect(fen).toContain('/');
});
