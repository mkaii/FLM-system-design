package experiment16;

import common.Log;
import common.PoolState;

import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 16 - SHUTDOWN() VS SHUTDOWNNOW(), SIDE BY SIDE
 *
 * CONFIG
 *   Two identical executors: core = 2, max = 2, queue = ArrayBlockingQueue(10)
 *   Both get 5 identical long tasks. A is closed with shutdown(), B with shutdownNow().
 *
 * WHAT TO WATCH - the summary lines at the end
 *   A: every task runs to completion, completed = 5, nothing returned
 *   B: running tasks are interrupted, queued tasks come back in the returned list
 *
 * EXPECTED
 *   shutdown()    - stop taking new work, finish what you already have
 *   shutdownNow() - stop taking new work, interrupt what is running, give back the rest
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 16 - shutdown() vs shutdownNow()");

        Log.line("---------- EXECUTOR A : shutdown() ----------");
        ThreadPoolExecutor a = newExecutor();
        for (int i = 1; i <= 5; i++) {
            a.execute(new InterruptibleTask("[A]", i));
        }
        Log.sleep(2500);
        a.shutdown();
        a.awaitTermination(60, TimeUnit.SECONDS);
        PoolState.print("A final", a);

        Log.line("---------- EXECUTOR B : shutdownNow() ----------");
        ThreadPoolExecutor b = newExecutor();
        for (int i = 1; i <= 5; i++) {
            b.execute(new InterruptibleTask("[B]", i));
        }
        Log.sleep(2500);
        List<Runnable> returned = b.shutdownNow();
        b.awaitTermination(60, TimeUnit.SECONDS);
        PoolState.print("B final", b);

        Log.line("=========================================================");
        Log.line("A (shutdown)    completed=" + a.getCompletedTaskCount() + "  returned=0");
        Log.line("B (shutdownNow) completed=" + b.getCompletedTaskCount()
                + "  returned=" + returned.size() + " -> " + returned);
    }

    private static ThreadPoolExecutor newExecutor() {
        return new ThreadPoolExecutor(2, 2, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(10));
    }
}
