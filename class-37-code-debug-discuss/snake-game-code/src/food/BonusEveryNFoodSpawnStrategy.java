package food;

public class BonusEveryNFoodSpawnStrategy implements IFoodSpawnStrategy {

    private final int n;
    private final FoodCreator normalCreator = new NormalFoodCreator();
    private final FoodCreator bonusCreator = new BonusFoodCreator();
    private int spawnCount = 0;

    public BonusEveryNFoodSpawnStrategy(int n) {
        this.n = n;
    }

    @Override
    public FoodCreator nextFoodCreator() {
        spawnCount++;
        return spawnCount % n == 0 ? bonusCreator : normalCreator;
    }
}
