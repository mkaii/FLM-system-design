package engine.state;

import common.Direction;
import engine.SnakeGame;

public interface IGameState {

    void move(SnakeGame game, Direction direction);

    void pause(SnakeGame game);

    void resume(SnakeGame game);
}
