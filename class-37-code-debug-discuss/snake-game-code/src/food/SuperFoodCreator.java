package food;

import common.Point;

public class SuperFoodCreator extends FoodCreator {

    @Override
    protected FoodItem createFood(Point position) {
        return new SuperFood(position);
    }
}
