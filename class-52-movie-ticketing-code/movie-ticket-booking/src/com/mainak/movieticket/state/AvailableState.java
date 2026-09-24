package com.mainak.movieticket.state;

import com.mainak.movieticket.domain.SeatStatus;
import com.mainak.movieticket.domain.ShowSeat;
import com.mainak.movieticket.exception.InvalidStateTransitionException;

public class AvailableState implements SeatState {

    public void lock(ShowSeat showSeat, String userId, String lockedUntil) {
        showSeat.setStatus(SeatStatus.LOCKED);
        showSeat.setLockedBy(userId);
        showSeat.setLockedUntil(lockedUntil);
        showSeat.setState(new LockedState());
    }

    public void book(ShowSeat showSeat) {
        throw new InvalidStateTransitionException("Seat must be locked before it can be booked");
    }

    public void release(ShowSeat showSeat) {
        // already available, nothing to do
    }
}
