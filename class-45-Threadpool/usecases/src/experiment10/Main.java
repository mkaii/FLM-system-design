package experiment10;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 10 - ARRAYBLOCKINGQUEUE VS LINKEDBLOCKINGQUEUE
 *
 * CONFIG
 *   Two executors, identical except for the queue:
 *     Executor A -> ArrayBlockingQueue(3)
 *     Executor B -> LinkedBlockingQueue(3)
 *   Same workload of 9 tasks is run through each.
 *
 * WHAT IS BEING TESTED
 *   Whether the two queue classes behave differently when both are bounded.
 *
 * WHAT TO WATCH
 *   - the accepted/rejected counts should come out the same for A and B
 *   - poolSize should reach 5 in both
 *
 * EXPECTED
 *   Both give the same executor behaviour. They differ internally (array of
 *   fixed slots vs linked nodes) but for ThreadPoolExecutor what matters is
 *   only whether the queue can refuse a task.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 10 - Array vs Linked, both bounded to 3");

        runWorkload("A - ArrayBlockingQueue(3) ", new ArrayBlockingQueue<Runnable>(3));
        runWorkload("B - LinkedBlockingQueue(3)", new LinkedBlockingQueue<Runnable>(3));
    }

    private static void runWorkload(String label, BlockingQueue<Runnable> queue)
            throws InterruptedException {

        Log.line("---------- " + label + " ----------");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS, queue);

        int accepted = 0;
        int rejected = 0;

        for (int i = 1; i <= 9; i++) {
            try {
                executor.execute(new SleepTask(i));
                accepted++;
            } catch (RejectedExecutionException e) {
                rejected++;
            }
        }

        PoolState.print(label + " at saturation", executor);
        Log.line(label + " accepted=" + accepted + "  rejected=" + rejected);

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
    }
}
