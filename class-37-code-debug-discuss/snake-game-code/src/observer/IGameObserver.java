package observer;

public interface IGameObserver {

    void onScoreChanged(int newScore);

    void onGameOver(int finalScore);
}
