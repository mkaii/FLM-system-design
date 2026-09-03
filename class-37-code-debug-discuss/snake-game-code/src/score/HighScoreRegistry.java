package score;

// Singleton, eagerly initialized so there is no unsynchronized lazy-init
// race - the same bug class-30's parking lot retro notes already caught once.
public class HighScoreRegistry {

    private static final HighScoreRegistry INSTANCE = new HighScoreRegistry();

    private int highScore = 0;

    private HighScoreRegistry() {
    }

    public static HighScoreRegistry getInstance() {
        return INSTANCE;
    }

    public synchronized void recordScore(int score) {
        if (score > highScore) {
            highScore = score;
        }
    }

    public synchronized int getHighScore() {
        return highScore;
    }
}
