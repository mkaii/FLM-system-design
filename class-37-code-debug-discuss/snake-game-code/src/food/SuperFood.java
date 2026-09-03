package food;

import common.Point;

// stretch goal proof: a third food kind, added without editing NormalFood, BonusFood,
// FoodItem, FoodCreator, or anything in engine/
public class SuperFood extends FoodItem {

    private static final int POINTS = 5;

    public SuperFood(Point position) {
        super(position, POINTS);
    }
}
