package food;

import common.Point;

// Factory Method: subclasses decide which FoodItem gets built.
public abstract class FoodCreator {

    protected abstract FoodItem createFood(Point position);

    public final FoodItem spawnAt(Point position) {
        return createFood(position);
    }
}
