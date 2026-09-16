package experiment13;

import common.Log;

/*
 * Short task. These are the ones that sit in the queue and get discarded.
 */
public class QueuedTask implements Runnable {

    private final int taskId;

    public QueuedTask(int taskId) {
        this.taskId = taskId;
    }

    @Override
    public void run() {
        Log.line("Task " + taskId + " STARTED");
        Log.sleep(1000);
        Log.line("Task " + taskId + " FINISHED");
    }

    @Override
    public String toString() {
        return "Task-" + taskId;
    }
}
