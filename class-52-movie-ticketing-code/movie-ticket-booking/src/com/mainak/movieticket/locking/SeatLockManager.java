package com.mainak.movieticket.locking;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class SeatLockManager {

    private final ConcurrentHashMap<String, Lock> locks = new ConcurrentHashMap<>();

    /**
     * Runs an operation while holding the locks for all supplied show seats.
     * Sorting prevents deadlocks when two users select the same seats in a
     * different order.
     */
    public <T> T withSeatLocks(Collection<String> seatKeys, LockedOperation<T> operation) {
        List<String> keys = new ArrayList<>(seatKeys);
        keys.sort(Comparator.naturalOrder());
        List<Lock> acquiredLocks = new ArrayList<>();

        try {
            for (String key : keys) {
                Lock lock = locks.computeIfAbsent(key, ignored -> new ReentrantLock());
                lock.lock();
                acquiredLocks.add(lock);
            }
            return operation.execute();
        } finally {
            for (int index = acquiredLocks.size() - 1; index >= 0; index--) {
                acquiredLocks.get(index).unlock();
            }
        }
    }

    @FunctionalInterface
    public interface LockedOperation<T> {
        T execute();
    }
}
