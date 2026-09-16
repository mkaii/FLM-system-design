package experiment14;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 14 - SHUTDOWN()
 *
 * CONFIG
 *   core = 2, max = 2, queue = ArrayBlockingQueue(10)
 *   5 tasks submitted, then shutdown() is called while work is still going on
 *
 * WHAT IS BEING TESTED
 *   What shutdown() actually stops.
 *
 * WHAT TO WATCH
 *   - the two running tasks are allowed to finish
 *   - the three QUEUED tasks also run to completion - they are not discarded
 *   - a task submitted after shutdown() is rejected
 *   - isShutdown() becomes true straight away, isTerminated() only later
 *
 * EXPECTED
 *   shutdown() means "accept nothing new, but finish everything already handed
 *   to me". It is a polite close, not a stop.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 14 - shutdown() finishes existing work");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 2, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(10));

        for (int i = 1; i <= 5; i++) {
            executor.execute(new SleepTask(i, 2000));
        }
        PoolState.print("before shutdown", executor);

        Log.sleep(500);
        Log.line("calling shutdown() while tasks 1 and 2 are still running");
        executor.shutdown();
        Log.line("isShutdown=" + executor.isShutdown() + "  isTerminated=" + executor.isTerminated());

        try {
            executor.execute(new SleepTask(99, 500));
            Log.line("task 99 accepted (unexpected)");
        } catch (RejectedExecutionException e) {
            Log.line("!!! task 99 REJECTED - no new work is accepted after shutdown()");
        }

        executor.awaitTermination(30, TimeUnit.SECONDS);
        Log.line("isShutdown=" + executor.isShutdown() + "  isTerminated=" + executor.isTerminated());
        PoolState.print("after termination", executor);
        Log.line(">>> completed=5 - every queued task still ran");
    }
}
