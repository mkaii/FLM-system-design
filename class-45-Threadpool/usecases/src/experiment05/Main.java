package experiment05;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 5 - OBSERVE EXECUTOR STATE
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5, queue = ArrayBlockingQueue(3)
 *   tasks submitted one at a time with a pause between them
 *
 * WHAT IS BEING TESTED
 *   Correlating the executor's own counters with the submission rules.
 *
 * WHAT TO WATCH - follow each counter down the output
 *   submit 1,2  -> poolSize climbs to 2, queued stays 0
 *   submit 3,4,5 -> poolSize stays 2, queued climbs to 3
 *   submit 6,7,8 -> queue is full, so poolSize climbs to 5, queued stays 3
 *   as tasks end -> active falls, completed rises, queued drains
 *
 * EXPECTED
 *   Every counter change should be explainable by the ordering rule from
 *   experiment 3. Note that active can be lower than poolSize: a worker that
 *   exists is not necessarily running something.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 5 - watching the executor counters change");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3));

        PoolState.print("initial", executor);

        for (int i = 1; i <= 8; i++) {
            try {
                executor.execute(new SleepTask(i));
                PoolState.print("after submit " + i, executor);
            } catch (RejectedExecutionException e) {
                Log.line("Task " + i + " rejected");
            }
            Log.sleep(300);
        }

        for (int check = 1; check <= 6; check++) {
            Log.sleep(2000);
            PoolState.print("while draining (" + check + ")", executor);
        }

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        PoolState.print("final", executor);
    }
}
