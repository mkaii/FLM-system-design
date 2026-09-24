package com.mainak.movieticket.state;

import com.mainak.movieticket.domain.ShowSeat;
import com.mainak.movieticket.exception.InvalidStateTransitionException;

public class BookedState implements SeatState {

    public void lock(ShowSeat showSeat, String userId, String lockedUntil) {
        throw new InvalidStateTransitionException("Seat is already booked");
    }

    public void book(ShowSeat showSeat) {
        throw new InvalidStateTransitionException("Seat is already booked");
    }

    public void release(ShowSeat showSeat) {
        throw new InvalidStateTransitionException("A booked seat cannot be released directly");
    }
}
