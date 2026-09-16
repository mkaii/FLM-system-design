package experiment14;

import common.Log;

/*
 * A named Runnable - no lambdas, no anonymous classes anywhere in this project.
 */
public class SleepTask implements Runnable {

    private final int taskId;
    private final long durationMillis;

    public SleepTask(int taskId, long durationMillis) {
        this.taskId = taskId;
        this.durationMillis = durationMillis;
    }

    @Override
    public void run() {
        Log.line("Task " + taskId + " STARTED");
        Log.sleep(durationMillis);
        Log.line("Task " + taskId + " FINISHED");
    }

    @Override
    public String toString() {
        return "Task-" + taskId;
    }
}
