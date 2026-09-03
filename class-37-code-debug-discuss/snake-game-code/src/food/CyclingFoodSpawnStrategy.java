package food;

// cycles normal -> bonus -> super -> normal ... ; exists mainly to show SuperFood
// plugging in with no edit to any existing strategy
public class CyclingFoodSpawnStrategy implements IFoodSpawnStrategy {

    private final FoodCreator[] cycle = {
            new NormalFoodCreator(),
            new BonusFoodCreator(),
            new SuperFoodCreator()
    };
    private int spawnCount = 0;

    @Override
    public FoodCreator nextFoodCreator() {
        return cycle[spawnCount++ % cycle.length];
    }
}
