package engine.state;

import common.Direction;
import engine.SnakeGame;
import engine.exception.InvalidMoveException;

public class RunningState implements IGameState {

    private static final RunningState INSTANCE = new RunningState();

    private RunningState() {
    }

    public static RunningState getInstance() {
        return INSTANCE;
    }

    @Override
    public void move(SnakeGame game, Direction direction) {
        game.performMove(direction);
    }

    @Override
    public void pause(SnakeGame game) {
        game.setState(PausedState.getInstance());
    }

    @Override
    public void resume(SnakeGame game) {
        throw new InvalidMoveException("game is already running");
    }
}
