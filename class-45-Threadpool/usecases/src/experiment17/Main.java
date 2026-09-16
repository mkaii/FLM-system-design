package experiment17;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 17 - AWAITTERMINATION
 *
 * CONFIG
 *   core = 2, max = 2, queue = ArrayBlockingQueue(10)
 *   4 tasks of 3 seconds each -> two rounds of work, about 6 seconds total
 *
 * WHAT IS BEING TESTED
 *   That shutdown() returns instantly while awaitTermination() is what waits.
 *
 * WHAT TO WATCH
 *   - the elapsed time printed immediately after shutdown() is near zero
 *   - the first awaitTermination(2, SECONDS) times out and returns false
 *   - the second call waits the rest of the way and returns true
 *
 * EXPECTED
 *   shutdown()        - starts the shutdown, does NOT block
 *   awaitTermination()- blocks the calling thread until done or the timeout expires
 *   The boolean return tells you which of those two happened. Ignoring it is a
 *   common mistake: a false means work is still running.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 17 - awaitTermination is what actually waits");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 2, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(10));

        long start = System.currentTimeMillis();

        for (int i = 1; i <= 4; i++) {
            executor.execute(new SleepTask(i));
        }

        executor.shutdown();
        Log.line("shutdown() returned after " + (System.currentTimeMillis() - start)
                + " ms - it did not wait for anything");

        boolean firstTry = executor.awaitTermination(2, TimeUnit.SECONDS);
        Log.line("awaitTermination(2s) returned " + firstTry
                + " after " + (System.currentTimeMillis() - start) + " ms  (false = timed out)");
        PoolState.print("still working", executor);

        boolean secondTry = executor.awaitTermination(30, TimeUnit.SECONDS);
        Log.line("awaitTermination(30s) returned " + secondTry
                + " after " + (System.currentTimeMillis() - start) + " ms  (true = finished)");

        PoolState.print("final", executor);
    }
}
