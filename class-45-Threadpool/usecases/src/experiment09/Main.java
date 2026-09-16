package experiment09;

import common.Log;
import common.PoolState;

import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 9 - BOUNDED LINKEDBLOCKINGQUEUE
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5
 *   queue = new LinkedBlockingQueue(3) - same class as experiment 8, now BOUNDED
 *   tasks submitted = 9 (same workload as experiments 3 and 4)
 *
 * WHAT IS BEING TESTED
 *   Whether the behaviour difference in experiment 8 came from the queue CLASS
 *   or from the queue being unbounded.
 *
 * WHAT TO WATCH
 *   - identical behaviour to ArrayBlockingQueue(3): 2 workers, 3 queued,
 *     then extra workers up to 5, then rejection on the 9th task
 *
 * EXPECTED
 *   The important question is never "Linked or Array". It is "bounded or not".
 *   Same class as experiment 8, completely different behaviour, because of the 3.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 9 - bounded LinkedBlockingQueue behaves like ArrayBlockingQueue");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new LinkedBlockingQueue<Runnable>(3));    // capacity 3 = bounded

        for (int i = 1; i <= 9; i++) {
            try {
                executor.execute(new SleepTask(i));
                PoolState.print("accepted task " + i, executor);
            } catch (RejectedExecutionException e) {
                Log.line("!!! Task " + i + " REJECTED - pool at max and queue full");
            }
        }

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        PoolState.print("after termination", executor);
    }
}
