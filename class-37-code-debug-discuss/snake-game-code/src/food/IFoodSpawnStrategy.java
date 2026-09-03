package food;

// Strategy: decides which FoodCreator to use for the next spawn.
// Independent from FoodCreator itself, which only decides how to build
// whatever type it was asked to build.
public interface IFoodSpawnStrategy {

    FoodCreator nextFoodCreator();
}
