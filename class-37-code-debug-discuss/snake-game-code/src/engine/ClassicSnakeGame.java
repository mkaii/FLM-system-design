package engine;

import board.Board;
import common.Point;
import food.IFoodSpawnStrategy;

import java.util.Random;

public class ClassicSnakeGame extends SnakeGame {

    public ClassicSnakeGame(Board board, Point startPosition, IFoodSpawnStrategy foodSpawnStrategy, Random random) {
        super(board, startPosition, foodSpawnStrategy, random);
    }

    @Override
    protected Point handleBoundary(Point rawNewHead) {
        boolean withinBounds = getBoard().isWithinBounds(rawNewHead.getRow(), rawNewHead.getCol());
        return withinBounds ? rawNewHead : null; // null -> hitting the wall ends the game
    }
}
