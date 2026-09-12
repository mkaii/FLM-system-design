import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class Counter {

    Lock lock = new ReentrantLock();

    private int count = 0;

    public void increment() throws InterruptedException {

        if (lock.tryLock(3000, TimeUnit.MILLISECONDS)) {
            try {
                Thread.sleep(3000);
                count++;


            } catch (Exception e) {

            } finally {
                lock.unlock();
            }
        }
        else{
            System.out.println(Thread.currentThread().getName() + " dont care about the lock .....will return later");
        }
    }

    public int getCount() {
        return count;
    }
}
