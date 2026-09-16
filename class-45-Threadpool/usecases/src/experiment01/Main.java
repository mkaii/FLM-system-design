package experiment01;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 1 - ONLY CORE THREADS
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5, queue = ArrayBlockingQueue(3)
 *   tasks submitted = 2
 *
 * WHAT IS BEING TESTED
 *   What the pool does when the work fits inside the core threads.
 *
 * WHAT TO WATCH
 *   - two different worker thread names in the output
 *   - both tasks start immediately, neither waits
 *   - queued stays 0 the whole time
 *
 * EXPECTED
 *   poolSize grows 0 -> 1 -> 2 and stops. maximumPoolSize is never approached,
 *   because a worker is only created while poolSize < corePoolSize.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 1 - only core threads");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2,                                  // corePoolSize
                5,                                  // maximumPoolSize
                60, TimeUnit.SECONDS,               // keepAliveTime for non-core threads
                new ArrayBlockingQueue<Runnable>(3));

        PoolState.print("before any submit", executor);

        for (int i = 1; i <= 2; i++) {
            executor.execute(new SleepTask(i));
            PoolState.print("after submitting task " + i, executor);
        }

        Log.sleep(500);
        PoolState.print("while both tasks run", executor);

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);



        PoolState.print("after termination", executor);
    }
}
