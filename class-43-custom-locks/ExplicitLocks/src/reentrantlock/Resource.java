package reentrantlock;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class Resource {

    private final Lock lock = new ReentrantLock();

    public void outer() throws InterruptedException {
        lock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + " acquired lock in outer");
            Thread.sleep(10000);
            inner();
        } finally {
            lock.unlock();
        }
    }

    public void inner() {
        if (lock.tryLock()) {
            try {
                System.out.println(Thread.currentThread().getName() + " acquired lock in inner");
            } finally {
                lock.unlock();
            }
        } else {
            System.out.println(Thread.currentThread().getName() + " ignored the lock");
        }
    }
}
