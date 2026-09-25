package com.mainak.movieticket.state;

import com.mainak.movieticket.Model.ShowSeat;

public interface SeatState {

    void lock(ShowSeat showSeat, String userId, String lockedUntil);

    void book(ShowSeat showSeat);

    void release(ShowSeat showSeat);
}
