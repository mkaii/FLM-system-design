package experiment06;

import common.Log;

/*
 * A named Runnable - no lambdas, no anonymous classes anywhere in this project.
 * Sleeps for 2 seconds so the worker thread stays busy long enough to observe.
 */
public class SleepTask implements Runnable {

    private final int taskId;

    public SleepTask(int taskId) {
        this.taskId = taskId;
    }

    @Override
    public void run() {
        Log.line("Task " + taskId + " STARTED");
        Log.sleep(2000);
        Log.line("Task " + taskId + " FINISHED");
    }

    @Override
    public String toString() {
        return "Task-" + taskId;
    }
}
