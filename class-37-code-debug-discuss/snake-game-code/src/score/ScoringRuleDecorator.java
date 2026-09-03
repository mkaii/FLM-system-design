package score;

import food.FoodItem;

// Decorator: wraps whatever scoring rule is already in place and forwards everything it
// does not explicitly change, so temporary effects can stack on top of each other
public abstract class ScoringRuleDecorator implements IScoringRule {

    protected final IScoringRule wrapped;

    protected ScoringRuleDecorator(IScoringRule wrapped) {
        this.wrapped = wrapped;
    }

    @Override
    public int pointsFor(FoodItem food) {
        return wrapped.pointsFor(food);
    }

    @Override
    public void onMove() {
        wrapped.onMove();
    }
}
