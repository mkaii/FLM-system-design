package observer;

import score.HighScoreRegistry;

public class HighScoreObserver implements IGameObserver {

    @Override
    public void onScoreChanged(int newScore) {
        // high score only matters once the game actually ends
    }

    @Override
    public void onGameOver(int finalScore) {
        HighScoreRegistry.getInstance().recordScore(finalScore);
    }
}
