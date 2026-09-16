package experiment15;

import common.Log;

/*
 * Sleeps in 1 second slices for up to 10 seconds, so it can notice an interrupt
 * between slices and report it. This is what makes cooperative cancellation
 * visible - a task that never checks would simply carry on.
 */
public class InterruptibleTask implements Runnable {

    private static final int SLICES = 10;

    private final int taskId;

    public InterruptibleTask(int taskId) {
        this.taskId = taskId;
    }

    @Override
    public void run() {
        Log.line("Task " + taskId + " STARTED");
        for (int i = 1; i <= SLICES; i++) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Log.line("Task " + taskId + " was INTERRUPTED at slice " + i + " - choosing to stop");
                Thread.currentThread().interrupt();
                return;
            }
        }
        Log.line("Task " + taskId + " FINISHED normally");
    }

    @Override
    public String toString() {
        return "Task-" + taskId;
    }
}
