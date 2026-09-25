package com.mainak.movieticket.state;

import com.mainak.movieticket.Model.SeatStatus;
import com.mainak.movieticket.Model.ShowSeat;
import com.mainak.movieticket.exception.InvalidStateTransitionException;

public class LockedState implements SeatState {

    public void lock(ShowSeat showSeat, String userId, String lockedUntil) {
        throw new InvalidStateTransitionException("Seat is already locked by another user");
    }

    public void book(ShowSeat showSeat) {
        showSeat.setStatus(SeatStatus.BOOKED);
        showSeat.setLockedBy(null);
        showSeat.setLockedUntil(null);
        showSeat.setState(new BookedState());
    }

    public void release(ShowSeat showSeat) {
        showSeat.setStatus(SeatStatus.AVAILABLE);
        showSeat.setLockedBy(null);
        showSeat.setLockedUntil(null);
        showSeat.setState(new AvailableState());
    }
}
