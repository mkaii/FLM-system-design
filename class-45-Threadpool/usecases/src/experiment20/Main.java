package experiment20;

import common.Log;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 20 - FUTURE.CANCEL()
 *
 * CONFIG
 *   core = 2, max = 2, queue = ArrayBlockingQueue(10)
 *   Two identical 8-slice tasks. One is cancelled with true, the other with false.
 *
 * WHAT IS BEING TESTED
 *   The difference between cancel(true) and cancel(false) on a task that is
 *   ALREADY RUNNING.
 *
 * WHAT TO WATCH
 *   - task 1, cancel(true): the worker is interrupted and the task stops early
 *   - task 2, cancel(false): NO interrupt is sent, so the task runs to the end
 *     even though isCancelled() reports true
 *
 * EXPECTED
 *   cancel(true)  - ask the running thread to stop by interrupting it
 *   cancel(false) - only mark the Future cancelled; a running task is left alone
 *
 * IMPORTANT
 *   Neither version forcibly kills a thread. cancel(true) only works because the
 *   task checks the interrupt flag. isCancelled() returning true says nothing
 *   about whether the work actually stopped.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 20 - cancel(true) vs cancel(false)");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 2, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(10));

        Log.line("--- task 1 will get cancel(TRUE) ---");
        Future<?> withInterrupt = executor.submit(new CancellableTask(1));
        Log.sleep(2500);
        boolean c1 = withInterrupt.cancel(true);
        Log.line("cancel(true) returned " + c1 + "   isCancelled=" + withInterrupt.isCancelled());

        Log.sleep(2000);

        Log.line("--- task 2 will get cancel(FALSE) ---");
        Future<?> withoutInterrupt = executor.submit(new CancellableTask(2));
        Log.sleep(2500);
        boolean c2 = withoutInterrupt.cancel(false);
        Log.line("cancel(false) returned " + c2 + "  isCancelled=" + withoutInterrupt.isCancelled());
        Log.line(">>> watch task 2 keep printing slices even though it is 'cancelled'");

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        Log.line("done - compare how far each task got");
    }
}
