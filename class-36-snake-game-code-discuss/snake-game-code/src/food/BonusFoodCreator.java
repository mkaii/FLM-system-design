package food;

import common.Point;

public class BonusFoodCreator extends FoodCreator {

    @Override
    protected FoodItem createFood(Point position) {
        return new BonusFood(position);
    }
}
