package experiment13;

import common.Log;

/*
 * Runs for 15 seconds. Used for the two tasks that must stay RUNNING on the
 * workers for the whole demo, so the rejection policy can be shown to leave
 * them alone.
 */
public class LongRunningTask implements Runnable {

    private final int taskId;

    public LongRunningTask(int taskId) {
        this.taskId = taskId;
    }

    @Override
    public void run() {
        Log.line("Task " + taskId + " STARTED (long running)");
        Log.sleep(15000);
        Log.line("Task " + taskId + " FINISHED");
    }

    @Override
    public String toString() {
        return "Task-" + taskId;
    }
}
