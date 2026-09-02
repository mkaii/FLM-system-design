package engine.state;

import common.Direction;
import engine.SnakeGame;
import engine.exception.InvalidMoveException;

public class PausedState implements IGameState {

    private static final PausedState INSTANCE = new PausedState();

    private PausedState() {
    }

    public static PausedState getInstance() {
        return INSTANCE;
    }

    @Override
    public void move(SnakeGame game, Direction direction) {
        throw new InvalidMoveException("cannot move while paused");
    }

    @Override
    public void pause(SnakeGame game) {
        throw new InvalidMoveException("game is already paused");
    }

    @Override
    public void resume(SnakeGame game) {
        game.setState(RunningState.getInstance());
    }
}
