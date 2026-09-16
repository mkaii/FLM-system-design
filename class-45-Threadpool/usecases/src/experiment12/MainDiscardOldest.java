package experiment12;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 12D - DiscardOldestPolicy
 *
 * CONFIG
 *   core = 2, max = 5, queue = ArrayBlockingQueue(3), DiscardOldestPolicy
 *   8 slow tasks saturate the executor, then a MarkerTask is submitted
 *
 * WHAT TO WATCH
 *   - the queue contents are printed before and after the extra submission
 *   - the OLDEST task still waiting in the queue disappears from that list
 *   - MarkerTask takes its place and will eventually run
 *
 * EXPECTED
 *   "DiscardOldest" means the oldest QUEUED task is thrown away to make room.
 *
 * IMPORTANT - what it does NOT mean
 *   It does not stop or kill the oldest RUNNING task. Tasks already executing
 *   on a worker are untouched. Only the waiting list is affected.
 */
public class MainDiscardOldest {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 12D - DiscardOldestPolicy");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3),
                new ThreadPoolExecutor.DiscardOldestPolicy());

        for (int i = 1; i <= 8; i++) {
            executor.execute(new SleepTask(i));
        }
        PoolState.print("saturated", executor);
        Log.line("QUEUE BEFORE: " + executor.getQueue());

        executor.execute(new MarkerTask(99));

        Log.line("QUEUE AFTER : " + executor.getQueue());
        Log.line(">>> the oldest waiting task was dropped, Marker-99 joined the back");

        executor.shutdown();
        executor.awaitTermination(60, TimeUnit.SECONDS);
    }
}
