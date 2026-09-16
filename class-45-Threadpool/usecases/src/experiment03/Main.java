package experiment03;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 3 - QUEUE FULL, THEN EXTRA THREADS
 *
 * CONFIG
 *   corePoolSize = 2, maximumPoolSize = 5, queue = ArrayBlockingQueue(3)
 *   tasks submitted = 8, each sleeping 4 seconds
 *
 * WHAT IS BEING TESTED
 *   What happens once the queue can take no more.
 *
 * WHAT TO WATCH
 *   - tasks 1,2 start on the two core workers
 *   - tasks 3,4,5 go into the queue (queued = 3, poolSize still 2)
 *   - tasks 6,7,8 cannot be queued, so workers 3,4,5 are created for them
 *   - poolSize reaches 5 and stops
 *
 * EXPECTED - the full ordering rule
 *   1. poolSize < corePoolSize      -> create a worker
 *   2. otherwise try to queue the task
 *   3. queue full and poolSize < max -> create another worker
 *   4. queue full and poolSize = max -> reject (see experiment 4)
 *
 * NOTE
 *   Tasks 6,7,8 start running BEFORE tasks 3,4,5 which were submitted earlier.
 *   Submission order is not execution order.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 3 - extra workers appear only once the queue is full");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 5, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3));

        for (int i = 1; i <= 8; i++) {
            executor.execute(new SleepTask(i));
            PoolState.print("after submitting task " + i, executor);
        }

        Log.line(">>> 2 core workers + 3 queued + 3 extra workers = 8 tasks accommodated");

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        PoolState.print("after termination", executor);
    }
}
