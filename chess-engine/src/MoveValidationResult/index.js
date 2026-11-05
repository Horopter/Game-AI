export const MoveValidationResult = {
  VALID: 0, // no error
  OUT_OF_BOUNDS: 1 << 0,              // 1
  NO_PIECE_AT_SOURCE: 1 << 1,         // 2
  WRONG_TURN: 1 << 2,                 // 4
  DESTINATION_OCCUPIED_BY_FRIENDLY: 1 << 3,  // 8
  ILLEGAL_PAWN_MOVE: 1 << 4,          // 16
  ILLEGAL_KNIGHT_MOVE: 1 << 5,        // 32
  ILLEGAL_BISHOP_MOVE: 1 << 6,        // 64
  ILLEGAL_ROOK_MOVE: 1 << 7,          // 128
  ILLEGAL_QUEEN_MOVE: 1 << 8,         // 256
  ILLEGAL_KING_MOVE: 1 << 9,          // 512
  PATH_NOT_CLEAR: 1 << 10             // 1024
};
