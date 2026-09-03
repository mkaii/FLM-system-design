package engine;

import board.Board;
import common.Point;
import food.IFoodSpawnStrategy;

import java.util.Random;

// stretch goal proof: a third boundary mode, added without editing SnakeGame,
// ClassicSnakeGame, or WrapAroundSnakeGame.
// Pac-Man style board: the left/right edges are tunnels that wrap, the top/bottom
// edges are solid walls that end the game.
public class CylinderSnakeGame extends SnakeGame {

    public CylinderSnakeGame(Board board, Point startPosition, IFoodSpawnStrategy foodSpawnStrategy, Random random) {
        super(board, startPosition, foodSpawnStrategy, random);
    }

    @Override
    protected Point handleBoundary(Point rawNewHead) {
        int row = rawNewHead.getRow();
        if (row < 0 || row >= getBoard().getHeight()) {
            return null; // top/bottom are fatal
        }
        int wrappedCol = Math.floorMod(rawNewHead.getCol(), getBoard().getWidth());
        return new Point(row, wrappedCol); // left/right wrap
    }
}
