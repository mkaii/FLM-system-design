package observer;

public class ConsoleScoreObserver implements IGameObserver {

    @Override
    public void onScoreChanged(int newScore) {
        System.out.println("score: " + newScore);
    }

    @Override
    public void onGameOver(int finalScore) {
        System.out.println("game over, final score: " + finalScore);
    }
}
