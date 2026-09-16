package experiment16;

import common.Log;

/*
 * Runs for up to 3 seconds in 1 second slices. The label says which executor
 * (A or B) the task belongs to, so the two halves of the comparison can be told
 * apart in the output.
 */
public class InterruptibleTask implements Runnable {

    private static final int SLICES = 3;

    private final String label;
    private final int taskId;

    public InterruptibleTask(String label, int taskId) {
        this.label = label;
        this.taskId = taskId;
    }

    @Override
    public void run() {
        Log.line(label + " Task " + taskId + " STARTED");
        for (int i = 1; i <= SLICES; i++) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Log.line(label + " Task " + taskId + " INTERRUPTED - stopping early");
                Thread.currentThread().interrupt();
                return;
            }
        }
        Log.line(label + " Task " + taskId + " FINISHED normally");
    }

    @Override
    public String toString() {
        return label + "Task-" + taskId;
    }
}
