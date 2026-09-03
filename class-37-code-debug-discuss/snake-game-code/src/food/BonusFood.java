package food;

import common.Point;

public class BonusFood extends FoodItem {

    private static final int POINTS = 3;

    public BonusFood(Point position) {
        super(position, POINTS);
    }
}
