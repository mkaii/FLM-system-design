package experiment12;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 12C - DiscardPolicy
 *
 * CONFIG
 *   core = 2, max = 5, queue = ArrayBlockingQueue(3), DiscardPolicy
 *   8 slow tasks saturate the executor, then a MarkerTask is submitted
 *
 * WHAT TO WATCH
 *   - no exception
 *   - MarkerTask never prints anything at all
 *
 * EXPECTED
 *   The task is dropped in complete silence. execute() returns normally and the
 *   submitter has no way of knowing the work was thrown away. Useful when losing
 *   work is genuinely acceptable, dangerous everywhere else.
 */
public class MainDiscard {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 12C - DiscardPolicy");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3),
                new ThreadPoolExecutor.DiscardPolicy());

        for (int i = 1; i <= 8; i++) {
            executor.execute(new SleepTask(i));
        }
        PoolState.print("saturated", executor);

        executor.execute(new MarkerTask(99));
        Log.line("execute() returned normally - no exception, no sign anything was lost");
        Log.line(">>> MarkerTask 99 will never print. Its work simply vanished.");

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
    }
}
