package experiment08;

import common.Log;
import common.PoolState;

import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 8 - UNBOUNDED LINKEDBLOCKINGQUEUE
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5
 *   queue = new LinkedBlockingQueue() with NO capacity argument -> effectively unbounded
 *   tasks submitted = 20, each sleeping 2 seconds
 *
 * WHAT IS BEING TESTED
 *   Whether maximumPoolSize still means anything when the queue never fills.
 *
 * WHAT TO WATCH
 *   - queued climbs to 18 and keeps climbing
 *   - poolSize NEVER goes above 2
 *   - workers 3, 4 and 5 are never created, even though max is 5
 *
 * EXPECTED
 *   Extra workers are only created when the queue REFUSES a task. An unbounded
 *   queue never refuses, so step 3 of the ordering rule is never reached and
 *   maximumPoolSize becomes dead configuration.
 *
 * WHY THIS MATTERS
 *   Executors.newFixedThreadPool() uses exactly this shape. Setting a big
 *   maximumPoolSize with an unbounded queue does not give you more workers -
 *   it just lets work pile up in memory instead.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 8 - unbounded queue means maximumPoolSize is ignored");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new LinkedBlockingQueue<Runnable>());     // no capacity = unbounded

        for (int i = 1; i <= 20; i++) {
            executor.execute(new SleepTask(i));
        }

        for (int check = 1; check <= 5; check++) {
            PoolState.print("check " + check, executor);
            Log.sleep(2000);
        }

        Log.line(">>> poolSize never exceeded 2 even though maximumPoolSize was 5");

        executor.shutdown();
        executor.awaitTermination(60, TimeUnit.SECONDS);
        PoolState.print("after termination", executor);
    }
}
