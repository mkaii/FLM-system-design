package experiment19;

import common.Log;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 19 - SUBMIT + FUTURE.GET()
 *
 * CONFIG
 *   core = 2, max = 2, queue = ArrayBlockingQueue(10)
 *   One deliberately slow task of 4 seconds.
 *
 * WHAT IS BEING TESTED
 *   What get() does to the thread that calls it.
 *
 * WHAT TO WATCH
 *   - main prints a line, then calls get()
 *   - main produces NO output for about 4 seconds while it is parked in get()
 *   - the task runs on a pool thread the whole time
 *   - the elapsed time printed after get() is roughly the task duration
 *
 * EXPECTED
 *   get() blocks the CALLING thread until the task finishes. The work is still
 *   done on a worker thread - but the caller has chosen to wait for it, which
 *   throws away the concurrency it just gained.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        Log.banner("EXPERIMENT 19 - Future.get() blocks the caller");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 2, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(10));

        long start = System.currentTimeMillis();

        Future<?> future = executor.submit(new SleepTask(1));
        Log.line("submitted, and main is free at " + (System.currentTimeMillis() - start) + " ms");

        Log.line("calling get() now - main will go quiet until the task is done");
        future.get();
        Log.line("get() returned after " + (System.currentTimeMillis() - start) + " ms");

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);
    }
}
