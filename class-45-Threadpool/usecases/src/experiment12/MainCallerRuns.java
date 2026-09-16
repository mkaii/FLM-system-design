package experiment12;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 12B - CallerRunsPolicy
 *
 * CONFIG
 *   core = 2, max = 5, queue = ArrayBlockingQueue(3), CallerRunsPolicy
 *   8 slow tasks saturate the executor, then a MarkerTask is submitted
 *
 * WHAT TO WATCH
 *   - no exception is thrown
 *   - MarkerTask DOES run, and the thread name printed is "main", not a pool thread
 *
 * EXPECTED
 *   The rejected task is handed back to whoever submitted it, so the submitting
 *   thread runs the work itself. Nothing is lost, but the submitter is blocked
 *   while it runs - which naturally slows down whoever is producing work.
 */
public class MainCallerRuns {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 12B - CallerRunsPolicy");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3),
                new ThreadPoolExecutor.CallerRunsPolicy());

        for (int i = 1; i <= 8; i++) {
            executor.execute(new SleepTask(i));
        }
        PoolState.print("saturated", executor);

        Log.line("submitting MarkerTask - watch WHICH thread ends up running it");
        executor.execute(new MarkerTask(99));
        Log.line("execute() returned - no exception was thrown");

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
    }
}
