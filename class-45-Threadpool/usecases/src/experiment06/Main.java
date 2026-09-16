package experiment06;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 6 - KEEP ALIVE TIME
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5, queue = ArrayBlockingQueue(3)
 *   keepAliveTime = 5 seconds
 *   8 tasks submitted to force all 5 workers into existence, then nothing more
 *
 * WHAT IS BEING TESTED
 *   How long an idle NON-CORE worker survives with no work to do.
 *
 * WHAT TO WATCH
 *   - poolSize reaches 5 while the burst is being handled
 *   - after the work is done, nothing is submitted for 12 seconds
 *   - poolSize falls back towards 2 as the idle extra workers time out
 *
 * EXPECTED
 *   The 3 non-core workers die after about 5 idle seconds.
 *   The 2 core workers stay alive - keepAliveTime does not apply to them
 *   unless allowCoreThreadTimeOut is switched on (see experiment 7).
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 6 - idle non-core workers time out, core workers stay");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5,
                5, TimeUnit.SECONDS,            // keepAliveTime
                new ArrayBlockingQueue<Runnable>(3));

        for (int i = 1; i <= 8; i++) {
            executor.execute(new SleepTask(i));
        }
        PoolState.print("right after the burst", executor);

        Log.sleep(5000);
        PoolState.print("burst finished, workers now idle", executor);

        for (int check = 1; check <= 6; check++) {
            Log.sleep(2000);
            PoolState.print("idle check " + check, executor);
        }

        Log.line(">>> poolSize should now be back down to the 2 core workers");

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);
    }
}
