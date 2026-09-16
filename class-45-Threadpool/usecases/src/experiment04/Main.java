package experiment04;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 4 - FULL POOL + FULL QUEUE = REJECTION
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5, queue = ArrayBlockingQueue(3)
 *   rejection policy = AbortPolicy (this is also the default)
 *   tasks submitted = 9, each sleeping 5 seconds
 *
 * WHAT IS BEING TESTED
 *   The capacity of the executor, and what happens one task past it.
 *
 * WHAT TO WATCH
 *   - tasks 1-8 are accepted: 5 running on workers, 3 waiting in the queue
 *   - task 9 is rejected and RejectedExecutionException is thrown to the SUBMITTER
 *
 * EXPECTED
 *   Total capacity = maximumPoolSize + queue capacity = 5 + 3 = 8.
 *   Rejection needs all three at once: pool at max, queue full, another task arriving.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 4 - the 9th task is rejected");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3),
                new ThreadPoolExecutor.AbortPolicy());

        for (int i = 1; i <= 9; i++) {
            try {
                executor.execute(new SleepTask(i));
                PoolState.print("accepted task " + i, executor);
            } catch (RejectedExecutionException e) {
                Log.line("!!! Task " + i + " REJECTED -> " + e.getClass().getSimpleName());
                PoolState.print("state at rejection", executor);
            }
        }

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        PoolState.print("after termination", executor);
    }
}
