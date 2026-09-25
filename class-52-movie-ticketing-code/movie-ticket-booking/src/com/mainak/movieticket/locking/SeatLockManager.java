package com.mainak.movieticket.locking;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

public class SeatLockManager {

    private final ConcurrentHashMap<String, Lock> locks = new ConcurrentHashMap<>();

    /**
     * <ul>
     *   <li>Acquires temporary, exclusive locks before running an action that changes these seats.</li>
     *   <li>Sorts seat keys so overlapping multi-seat requests acquire locks in the same order.</li>
     *   <li>Keeps the acquired locks so it can release exactly those locks in reverse order, even if the action fails.</li>
     *   <li>These are concurrency locks only; they do not set a seat's booking status to {@code LOCKED}.</li>
     * </ul>
     */
    public <T> T executeWhileSeatLocksHeld(Collection<String> seatKeys, Supplier<T> action) {
        List<String> keys = new ArrayList<>(seatKeys);
        keys.sort(Comparator.naturalOrder());
        List<Lock> acquiredLocks = new ArrayList<>();

        try {
            for (String key : keys) {
                Lock lock = locks.computeIfAbsent(key, ignored -> new ReentrantLock());
                lock.lock();
                acquiredLocks.add(lock);
            }
            return action.get();
        } finally {
            for (int index = acquiredLocks.size() - 1; index >= 0; index--) {
                acquiredLocks.get(index).unlock();
            }
        }
    }

}
