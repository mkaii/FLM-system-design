package experiment12;

import common.Log;

/*
 * A task that announces loudly if it ever runs. Used to show whether a
 * rejected task was discarded silently or executed somewhere unexpected.
 */
public class MarkerTask implements Runnable {

    private final int taskId;

    public MarkerTask(int taskId) {
        this.taskId = taskId;
    }

    @Override
    public void run() {
        Log.line("*** MarkerTask " + taskId + " IS RUNNING - and this is the thread running it");
    }

    @Override
    public String toString() {
        return "Marker-" + taskId;
    }
}
