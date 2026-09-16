package experiment07;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 7 - CORE THREAD TIMEOUT
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5, queue = ArrayBlockingQueue(3)
 *   keepAliveTime = 5 seconds
 *   allowCoreThreadTimeOut(true)
 *
 * WHAT IS BEING TESTED
 *   Whether "core thread" really means "a thread that never goes away".
 *
 * WHAT TO WATCH
 *   - a few tasks run and poolSize grows
 *   - nothing is submitted afterwards
 *   - poolSize eventually falls all the way to 0, not just to 2
 *
 * EXPECTED
 *   With allowCoreThreadTimeOut(true) the keepAliveTime applies to core workers
 *   too, so an idle pool can empty completely. Compare with experiment 6, where
 *   poolSize stopped falling at 2.
 *
 * NOTE
 *   allowCoreThreadTimeOut requires keepAliveTime to be greater than zero.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 7 - with core timeout enabled, even core workers die");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5,
                5, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3));

        executor.allowCoreThreadTimeOut(true);
        Log.line("allowCoreThreadTimeOut = " + executor.allowsCoreThreadTimeOut());

        for (int i = 1; i <= 4; i++) {
            executor.execute(new SleepTask(i));
        }
        PoolState.print("right after submitting", executor);

        Log.sleep(3000);
        PoolState.print("work done, pool now idle", executor);

        for (int check = 1; check <= 6; check++) {
            Log.sleep(2000);
            PoolState.print("idle check " + check, executor);
        }

        Log.line(">>> poolSize should now be 0 - no worker survived");

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);
    }
}
