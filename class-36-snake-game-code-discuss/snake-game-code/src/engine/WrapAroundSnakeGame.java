package engine;

import board.Board;
import common.Point;
import food.IFoodSpawnStrategy;

import java.util.Random;

public class WrapAroundSnakeGame extends SnakeGame {

    public WrapAroundSnakeGame(Board board, Point startPosition, IFoodSpawnStrategy foodSpawnStrategy, Random random) {
        super(board, startPosition, foodSpawnStrategy, random);
    }

    @Override
    protected Point handleBoundary(Point rawNewHead) {
        int wrappedRow = Math.floorMod(rawNewHead.getRow(), getBoard().getHeight());
        int wrappedCol = Math.floorMod(rawNewHead.getCol(), getBoard().getWidth());
        return new Point(wrappedRow, wrappedCol); // never null - crossing an edge just wraps around
    }
}
