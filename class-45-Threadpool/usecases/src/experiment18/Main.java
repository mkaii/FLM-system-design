package experiment18;

import common.Log;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 18 - SUBMIT(RUNNABLE) VS EXECUTE(RUNNABLE)
 *
 * CONFIG
 *   core = 2, max = 2, queue = ArrayBlockingQueue(10)
 *   The SAME task class is run once with execute() and once with submit().
 *
 * WHAT IS BEING TESTED
 *   What the caller gets back in each case.
 *
 * WHAT TO WATCH
 *   - execute() returns nothing - there is no handle on the task at all
 *   - submit() returns a Future you can question later
 *   - isDone() is false right after submitting and true once the task ends
 *   - get() on a Runnable submission returns null, because a Runnable has no result
 *
 * EXPECTED
 *   execute - fire and forget
 *   submit  - keeps a handle so you can wait for it, check it, or cancel it
 */
public class Main {

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        Log.banner("EXPERIMENT 18 - execute() vs submit()");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 2, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(10));

        Log.line("--- execute() ---");
        executor.execute(new SleepTask(1));
        Log.line("execute() returned void - there is no way to ask about task 1 later");

        Log.sleep(2000);

        Log.line("--- submit() ---");
        Future<?> future = executor.submit(new SleepTask(2));
        Log.line("submit() returned a Future. isDone() right now = " + future.isDone());

        Object result = future.get();
        Log.line("future.get() returned " + result + "  (null - a Runnable produces no value)");
        Log.line("isDone() after get() = " + future.isDone()
                + "   isCancelled() = " + future.isCancelled());

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);
    }
}
