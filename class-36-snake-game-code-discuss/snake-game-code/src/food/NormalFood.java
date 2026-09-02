package food;

import common.Point;

public class NormalFood extends FoodItem {

    private static final int POINTS = 1;

    public NormalFood(Point position) {
        super(position, POINTS);
    }
}
