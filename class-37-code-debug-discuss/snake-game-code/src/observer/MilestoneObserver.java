package observer;

// stretch goal proof: a third listener, added without editing SnakeGame,
// ConsoleScoreObserver, HighScoreObserver, or IGameObserver
public class MilestoneObserver implements IGameObserver {

    private final int milestone;
    private boolean announced = false;

    public MilestoneObserver(int milestone) {
        this.milestone = milestone;
    }

    @Override
    public void onScoreChanged(int newScore) {
        if (!announced && newScore >= milestone) {
            announced = true;
            System.out.println("  [milestone] passed " + milestone + " points");
        }
    }

    @Override
    public void onGameOver(int finalScore) {
        if (!announced) {
            System.out.println("  [milestone] never reached " + milestone + " points");
        }
    }
}
