package score;

import food.FoodItem;

// a power-up: everything eaten is worth double, for a limited number of moves
public class DoublePointsDecorator extends ScoringRuleDecorator {

    private int movesRemaining;

    public DoublePointsDecorator(IScoringRule wrapped, int durationInMoves) {
        super(wrapped);
        this.movesRemaining = durationInMoves;
    }

    public boolean isActive() {
        return movesRemaining > 0;
    }

    @Override
    public int pointsFor(FoodItem food) {
        int base = super.pointsFor(food); // whatever the wrapped rule already decided
        return isActive() ? base * 2 : base;
    }

    // ticks down only after the current move has been scored, so a 1-move power-up
    // still applies to food eaten on that very move
    @Override
    public void onMove() {
        super.onMove();
        if (movesRemaining > 0) {
            movesRemaining--;
        }
    }
}
