package food;

import common.Point;

public abstract class FoodItem {

    private final Point position;
    private final int points;

    protected FoodItem(Point position, int points) {
        this.position = position;
        this.points = points;
    }

    public Point getPosition() {
        return position;
    }

    public int getPoints() {
        return points;
    }
}
