package food;

import java.util.Random;

public class RandomFoodSpawnStrategy implements IFoodSpawnStrategy {

    private static final double BONUS_PROBABILITY = 0.2;

    private final Random random;
    private final FoodCreator normalCreator = new NormalFoodCreator();
    private final FoodCreator bonusCreator = new BonusFoodCreator();

    public RandomFoodSpawnStrategy(Random random) {
        this.random = random;
    }

    @Override
    public FoodCreator nextFoodCreator() {
        return random.nextDouble() < BONUS_PROBABILITY ? bonusCreator : normalCreator;
    }
}
