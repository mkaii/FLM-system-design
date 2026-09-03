package score;

import food.FoodItem;

// the default rule: a food is worth exactly its face value, forever
public class BaseScoringRule implements IScoringRule {

    @Override
    public int pointsFor(FoodItem food) {
        return food.getPoints();
    }

    @Override
    public void onMove() {
        // nothing to expire
    }
}
