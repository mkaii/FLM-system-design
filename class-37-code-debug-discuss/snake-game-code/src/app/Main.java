package app;

import board.Board;
import common.Direction;
import common.Point;
import engine.ClassicSnakeGame;
import engine.SnakeGame;
import engine.WrapAroundSnakeGame;
import engine.exception.InvalidMoveException;
import food.BonusEveryNFoodSpawnStrategy;
import food.IFoodSpawnStrategy;
import food.RandomFoodSpawnStrategy;
import observer.ConsoleScoreObserver;
import observer.HighScoreObserver;
import score.HighScoreRegistry;

import java.util.Random;

public class Main {
    public static void main(String[] args) {
        classicGameDemo();
        System.out.println();
        wrapAroundGameDemo();
        System.out.println();
        System.out.println("all-time high score: " + HighScoreRegistry.getInstance().getHighScore());
    }

    private static void classicGameDemo() {
        System.out.println("-- classic snake game --");
        Board board = new Board(6, 6);
        Random random = new Random(42);
        IFoodSpawnStrategy spawnStrategy = new RandomFoodSpawnStrategy(random);
        SnakeGame game = new ClassicSnakeGame(board, new Point(3, 3), spawnStrategy, random);
        game.addObserver(new ConsoleScoreObserver());
        game.addObserver(new HighScoreObserver());

        runGreedyUntilGameOverOrLimit(game, 40);

        try {
            game.pause();
            game.move(Direction.UP);
        } catch (InvalidMoveException e) {
            System.out.println("expected failure: " + e.getMessage());
        }
    }

    private static void wrapAroundGameDemo() {
        System.out.println("-- wrap-around snake game (Template Method variant) --");
        Board board = new Board(5, 5);
        Random random = new Random(7);
        IFoodSpawnStrategy spawnStrategy = new BonusEveryNFoodSpawnStrategy(3);
        SnakeGame game = new WrapAroundSnakeGame(board, new Point(0, 0), spawnStrategy, random);
        game.addObserver(new ConsoleScoreObserver());

        // walking straight off the top edge would end a classic game immediately;
        // the wrap-around variant just reappears on the opposite edge instead
        for (int i = 0; i < 8; i++) {
            game.move(Direction.UP);
            System.out.println("head now at: " + game.getHead());
        }
    }

    // a tiny greedy bot: always steps toward the food, so the demo eats food and
    // grows deterministically regardless of where food randomly spawns
    private static void runGreedyUntilGameOverOrLimit(SnakeGame game, int maxSteps) {
        for (int i = 0; i < maxSteps && !game.isOver(); i++) {
            game.move(pickGreedyDirection(game.getHead(), game.getFoodPosition()));
        }
        if (game.isOver()) {
            System.out.println("stopped: game ended, final length: " + game.getLength());
        } else {
            System.out.println("stopped after step limit, score: " + game.getScore()
                    + ", length: " + game.getLength());
        }
    }

    private static Direction pickGreedyDirection(Point head, Point food) {
        if (food.getRow() < head.getRow()) return Direction.UP;
        if (food.getRow() > head.getRow()) return Direction.DOWN;
        if (food.getCol() < head.getCol()) return Direction.LEFT;
        return Direction.RIGHT;
    }
}
