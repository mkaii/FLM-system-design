package common;

import java.util.concurrent.ThreadPoolExecutor;

/*
 * Prints the executor's own counters so the internal state can be correlated
 * with what the tasks are doing.
 *
 *   poolSize   = how many worker threads exist right now
 *   active     = workers currently running a task
 *   queued     = tasks waiting in the queue
 *   completed     = tasks already finished
 *   everScheduled = tasks ever scheduled: completed + currently running + still queued
 *                   (an approximate count - see ThreadPoolExecutor.getTaskCount())
 */
public final class PoolState {

    private PoolState() {
    }

    public static void print(String label, ThreadPoolExecutor executor) {
        Log.line(String.format("%-30s poolSize=%d  active=%d  queued=%d  completed=%d  everScheduled=%d",
                label,
                executor.getPoolSize(),
                executor.getActiveCount(),
                executor.getQueue().size(),
                executor.getCompletedTaskCount(),
                executor.getTaskCount()));
    }
}
