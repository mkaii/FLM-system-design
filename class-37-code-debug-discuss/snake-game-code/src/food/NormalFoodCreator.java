package food;

import common.Point;

public class NormalFoodCreator extends FoodCreator {

    @Override
    protected FoodItem createFood(Point position) {
        return new NormalFood(position);
    }
}
