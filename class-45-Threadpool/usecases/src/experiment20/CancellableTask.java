package experiment20;

import common.Log;

/*
 * Works in 1 second slices for up to 8 seconds, checking the interrupt flag
 * between each one. A task that never checks would run to the end no matter
 * what cancel() was told to do.
 */
public class CancellableTask implements Runnable {

    private static final int SLICES = 8;

    private final int taskId;

    public CancellableTask(int taskId) {
        this.taskId = taskId;
    }

    @Override
    public void run() {
        Log.line("Task " + taskId + " STARTED");
        for (int i = 1; i <= SLICES; i++) {
            if (Thread.currentThread().isInterrupted()) {
                Log.line("Task " + taskId + " noticed the interrupt flag at slice " + i + " - stopping");
                return;
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Log.line("Task " + taskId + " interrupted while sleeping at slice " + i);
                Thread.currentThread().interrupt();
                return;
            }
            Log.line("Task " + taskId + " finished slice " + i);
        }
        Log.line("Task " + taskId + " RAN ALL THE WAY TO THE END");
    }
}
