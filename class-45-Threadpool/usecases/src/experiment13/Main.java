package experiment13;

import common.Log;
import common.PoolState;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/*
 * EXPERIMENT 13 - QUEUED TASK VS RUNNING TASK
 *
 * CONFIG
 *   core = 2, max = 2 (deliberately, so no extra workers can be created)
 *   queue = ArrayBlockingQueue(3), DiscardOldestPolicy
 *   Tasks 1 and 2 sleep for 15 seconds so they stay RUNNING for the whole demo.
 *   Tasks 3, 4, 5 fill the queue. Tasks 6 and 7 then trigger the policy.
 *
 * WHAT IS BEING TESTED
 *   Exactly which task DiscardOldestPolicy throws away.
 *
 * WHAT TO WATCH
 *   - tasks 1 and 2 print STARTED and keep running throughout
 *   - the queue starts as [Task-3, Task-4, Task-5]
 *   - submitting task 6 removes Task-3 from the queue
 *   - submitting task 7 removes Task-4
 *   - Task-1 and Task-2 are NEVER touched, and both print FINISHED
 *
 * EXPECTED
 *   Only waiting tasks are discardable. A task that already reached a worker is
 *   beyond the policy's reach - the executor has no way to un-run it.
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        Log.banner("EXPERIMENT 13 - DiscardOldest removes a QUEUED task, never a running one");

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2, 2, 60, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(3),
                new ThreadPoolExecutor.DiscardOldestPolicy());

        executor.execute(new LongRunningTask(1));
        executor.execute(new LongRunningTask(2));
        Log.sleep(300);
        Log.line("Tasks 1 and 2 are now RUNNING on the two workers");

        for (int i = 3; i <= 5; i++) {
            executor.execute(new QueuedTask(i));
        }
        Log.line("QUEUE (full)        : " + executor.getQueue());

        executor.execute(new QueuedTask(6));
        Log.line("after submitting 6  : " + executor.getQueue() + "   <- Task-3 was dropped");

        executor.execute(new QueuedTask(7));
        Log.line("after submitting 7  : " + executor.getQueue() + "   <- Task-4 was dropped");

        PoolState.print("running vs queued", executor);
        Log.line(">>> active=2 are the RUNNING tasks 1 and 2 - untouched by the policy");

        executor.shutdown();
        executor.awaitTermination(40, TimeUnit.SECONDS);
        PoolState.print("after termination", executor);
    }
}
