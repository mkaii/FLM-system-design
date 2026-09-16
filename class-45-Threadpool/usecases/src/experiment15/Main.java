package experiment15;

import common.Log;
import common.PoolState;

import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 15 - SHUTDOWNNOW()
 *
 * CONFIG
 *   core = 2, max = 2, queue = ArrayBlockingQueue(10)
 *   5 long tasks submitted, then shutdownNow() is called
 *
 * WHAT IS BEING TESTED
 *   What shutdownNow() does to running work and to waiting work.
 *
 * WHAT TO WATCH
 *   - tasks 1 and 2 print that they were INTERRUPTED and stop early
 *   - shutdownNow() RETURNS the tasks that were still waiting, and they never run
 *   - the returned list is printed, so you can see exactly which ones were dropped
 *
 * EXPECTED
 *   Running tasks are interrupted, queued tasks are handed back to you.
 *
 * IMPORTANT
 *   Interruption is a REQUEST, not a kill. It only works because the task checks
 *   for it. A task doing a long uninterruptible computation would carry on
 *   regardless - see the contrast in experiment 20.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 15 - shutdownNow() interrupts and returns the leftovers");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 2, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(10));

        for (int i = 1; i <= 5; i++) {
            executor.execute(new InterruptibleTask(i));
        }
        PoolState.print("before shutdownNow", executor);

        Log.sleep(2500);
        Log.line("calling shutdownNow()");
        List<Runnable> neverRan = executor.shutdownNow();

        Log.line("shutdownNow() returned " + neverRan.size() + " task(s) that never ran: " + neverRan);

        executor.awaitTermination(10, TimeUnit.SECONDS);
        PoolState.print("after termination", executor);
        Log.line(">>> compare completed here with the 5 completed in experiment 14");
    }
}
