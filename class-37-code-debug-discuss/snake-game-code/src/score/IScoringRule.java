package score;

import food.FoodItem;

// how many points a given food is worth right now, and a per-move tick so rules that
// expire after N moves can count down. Kept separate from FoodItem.getPoints() because
// a food's face value never changes - what changes is the rule applied on top of it.
public interface IScoringRule {

    int pointsFor(FoodItem food);

    // called once per committed move, after that move has been scored
    void onMove();
}
