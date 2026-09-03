package engine;

import board.Board;
import common.Direction;
import common.Point;
import engine.state.GameOverState;
import engine.state.IGameState;
import engine.state.RunningState;
import food.FoodItem;
import food.IFoodSpawnStrategy;
import observer.IGameObserver;
import score.BaseScoringRule;
import score.IScoringRule;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

public abstract class SnakeGame {

    private final Board board;
    private final IFoodSpawnStrategy foodSpawnStrategy;
    private final Random random;
    private final List<IGameObserver> observers = new ArrayList<>();

    private final Deque<Point> body = new ArrayDeque<>();
    private final Set<Point> occupied = new HashSet<>();// O(1)


    private IGameState state = RunningState.getInstance();
    private FoodItem currentFood;
    private int score = 0;

    // starts as the plain face-value rule; temporary effects get layered on top of
    // whatever is here via setScoringRule(), the game itself never learns their names
    private IScoringRule scoringRule = new BaseScoringRule();

    protected SnakeGame(Board board, Point startPosition, IFoodSpawnStrategy foodSpawnStrategy, Random random) {
        this.board = board;
        this.foodSpawnStrategy = foodSpawnStrategy;
        this.random = random;
        body.addFirst(startPosition);
        occupied.add(startPosition);
        this.currentFood = spawnFood();
    }

    // ---- public API: the facade calls these, they just forward to whichever state is active ----

    public void addObserver(IGameObserver observer) {
        observers.add(observer);
    }

    public void move(Direction direction) {
        state.move(this, direction);
    }

    public void pause() {
        state.pause(this);
    }

    public void resume() {
        state.resume(this);
    }

    // called by IGameState implementations to actually transition
    public void setState(IGameState state) {
        this.state = state;
    }

    public boolean isOver() {
        return state == GameOverState.getInstance();
    }

    public Point getHead() {
        return body.peekFirst();
    }

    public Point getFoodPosition() {
        return currentFood.getPosition();
    }

    public int getScore() {
        return score;
    }

    public int getLength() {
        return body.size();
    }

    public IScoringRule getScoringRule() {
        return scoringRule;
    }

    // read-then-wrap is the intended usage:
    //   game.setScoringRule(new DoublePointsDecorator(game.getScoringRule(), 10));
    public void setScoringRule(IScoringRule scoringRule) {
        this.scoringRule = scoringRule;
    }



    // called by RunningState once a move has been allowed through
    // ---- Template Method: the per-move pipeline is fixed; only boundary handling varies ----
    public void performMove(Direction direction) {
        Point currentHead = body.peekFirst();
        Point rawNewHead = new Point(currentHead.getRow() + direction.getDeltaRow(),
                currentHead.getCol() + direction.getDeltaCol());

        Point newHead = handleBoundary(rawNewHead); // <-- the one varying step
        if (newHead == null) {
            endGame();
            return;
        }

        Point tail = body.peekLast();
        boolean eatsFood = newHead.equals(currentFood.getPosition());
        //boolean bitesItself = occupied.contains(newHead) && !(newHead.equals(tail) && !eatsFood);
        boolean bitesItself = occupied.contains(newHead) && !(newHead.equals(tail));// food never on tail

        if (bitesItself) {
            endGame();
            return;
        }

        if (eatsFood) {
            body.addFirst(newHead);
            occupied.add(newHead);
            score += scoringRule.pointsFor(currentFood);
            currentFood = spawnFood();
            notifyScoreChanged();
        } else {
            // evict the tail before re-adding the head: if newHead == tail (the legal
            // chase-your-own-tail move), adding first would be a no-op on the Set since
            // that cell is already present, and the later remove(tail) would then wrongly
            // evict the cell the new head just re-claimed
            body.pollLast();
            occupied.remove(tail);
            body.addFirst(newHead);
            occupied.add(newHead);
        }

        // tick last, so a rule that expires after N moves still applied to the food
        // eaten on this move
        scoringRule.onMove();
    }

    // the varying step: null means "this position is not a legal place to be" -> game over
    protected abstract Point handleBoundary(Point rawNewHead);

    protected Board getBoard() {
        return board;
    }

    // keep finding positions until they are not on the snake itself!
    // once you get a random position not on the snake, break the loop

    private FoodItem spawnFood() {
        Point position;
        do {
            position = new Point(random.nextInt(board.getHeight()), random.nextInt(board.getWidth()));
        } while (occupied.contains(position));
        return foodSpawnStrategy.nextFoodCreator().spawnAt(position);
    }

    private void endGame() {
        setState(GameOverState.getInstance());
        notifyGameOver();
    }

    private void notifyScoreChanged() {
        for (IGameObserver observer : observers) {
            observer.onScoreChanged(score);
        }
    }

    private void notifyGameOver() {
        for (IGameObserver observer : observers) {
            observer.onGameOver(score);
        }
    }
}
