package engine.state;

import common.Direction;
import engine.SnakeGame;
import engine.exception.InvalidMoveException;

public class GameOverState implements IGameState {

    private static final GameOverState INSTANCE = new GameOverState();

    private GameOverState() {
    }

    public static GameOverState getInstance() {
        return INSTANCE;
    }

    @Override
    public void move(SnakeGame game, Direction direction) {
        throw new InvalidMoveException("game is over");
    }

    @Override
    public void pause(SnakeGame game) {
        throw new InvalidMoveException("game is over");
    }

    @Override
    public void resume(SnakeGame game) {
        throw new InvalidMoveException("game is over");
    }
}
