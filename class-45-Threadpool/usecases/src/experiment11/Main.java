package experiment11;

import common.Log;
import common.PoolState;

import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 11 - SYNCHRONOUSQUEUE
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5, queue = SynchronousQueue
 *   tasks submitted = 7, each sleeping 5 seconds
 *
 * WHAT IS BEING TESTED
 *   A queue that cannot store anything at all.
 *
 * WHAT TO WATCH
 *   - queued stays 0 for the whole run - it can never be anything else
 *   - poolSize climbs 1,2,3,4,5 as fast as tasks arrive
 *   - task 6 and 7 are REJECTED even though nothing is waiting in a queue
 *
 * EXPECTED
 *   SynchronousQueue has no capacity. A task is only accepted if a worker can
 *   take it right now, so step 2 of the ordering rule always fails and the
 *   executor jumps straight to "create another worker".
 *
 * COMPARE WITH
 *   experiment 8 - unbounded queue, workers never grow past core
 *   this one     - zero capacity queue, workers grow immediately to max
 *   The queue choice alone flips the behaviour completely.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 11 - SynchronousQueue forces workers to be created");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new SynchronousQueue<Runnable>());

        for (int i = 1; i <= 7; i++) {
            try {
                executor.execute(new SleepTask(i));
                PoolState.print("accepted task " + i, executor);
            } catch (RejectedExecutionException e) {
                Log.line("!!! Task " + i + " REJECTED - no worker free and pool is at max");
                PoolState.print("state at rejection", executor);
            }
        }

        Log.line(">>> queued was 0 the entire time - SynchronousQueue stores nothing");

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        PoolState.print("after termination", executor);
    }
}
