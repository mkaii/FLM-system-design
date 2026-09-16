package experiment02;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 2 - QUEUE BEFORE EXTRA THREADS
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5, queue = ArrayBlockingQueue(3)
 *   tasks submitted = 5, each sleeping 3 seconds
 *
 * WHAT IS BEING TESTED
 *   Whether the pool creates a third worker as soon as the core threads are busy.
 *   It does not.
 *
 * WHAT TO WATCH
 *   - only tasks 1 and 2 print STARTED at first
 *   - tasks 3, 4 and 5 sit in the queue (queued climbs to 3)
 *   - poolSize stays at 2 even though maximumPoolSize is 5
 *
 * EXPECTED
 *   The queue is filled BEFORE any extra worker is created. Extra workers are a
 *   last resort, not the first reaction to busy core threads.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 2 - queue fills before extra threads are made");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3));

        for (int i = 1; i <= 5; i++) {
            executor.execute(new SleepTask(i));
            PoolState.print("after submitting task " + i, executor);
        }

        Log.line(">>> poolSize is still 2 - tasks 3,4,5 are WAITING, not running");

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        PoolState.print("after termination", executor);
    }
}
