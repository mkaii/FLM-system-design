package experiment12;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 12A - AbortPolicy
 *
 * CONFIG
 *   core = 2, max = 5, queue = ArrayBlockingQueue(3), AbortPolicy
 *   8 slow tasks saturate the executor, then a MarkerTask is submitted
 *
 * WHAT TO WATCH
 *   - RejectedExecutionException is thrown back to the SUBMITTING thread
 *   - MarkerTask never prints, because it never runs
 *
 * EXPECTED
 *   The submitter is told, loudly, that the work was not accepted.
 *   This is the default policy when none is given.
 */
public class MainAbort {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 12A - AbortPolicy");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3),
                new ThreadPoolExecutor.AbortPolicy());

        for (int i = 1; i <= 8; i++) {
            executor.execute(new SleepTask(i));
        }
        PoolState.print("saturated", executor);

        try {
            executor.execute(new MarkerTask(99));
            Log.line("MarkerTask was accepted (unexpected)");
        } catch (RejectedExecutionException e) {
            Log.line("!!! REJECTED with " + e.getClass().getSimpleName()
                    + " - the submitter finds out immediately");
        }

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
    }
}
