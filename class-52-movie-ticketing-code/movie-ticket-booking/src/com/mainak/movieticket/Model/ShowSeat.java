package com.mainak.movieticket.Model;

import lombok.Getter;
import lombok.Setter;

import com.mainak.movieticket.state.AvailableState;
import com.mainak.movieticket.state.SeatState;

import java.time.Instant;

@Getter
@Setter
public class ShowSeat {

    private Show show;
    private Seat seat;
    private SeatStatus status;
    private String lockedBy;
    private String lockedUntil;
    private SeatState state;

    public ShowSeat(Show show, Seat seat) {
        this.show = show;
        this.seat = seat;
        this.status = SeatStatus.AVAILABLE;
        this.state = new AvailableState();
    }

    public void lock(String userId) {
        lock(userId, Instant.now().plusSeconds(300));
    }

    /**
     * <ul><li>Reserves this show-specific seat for a user until the supplied expiry time.</li></ul>
     */
    public void lock(String userId, Instant lockedUntil) {
        state.lock(this, userId, lockedUntil.toString());
    }

    /**
     * <ul><li>Marks this seat as permanently booked after payment succeeds.</li></ul>
     */
    public void book() {
        state.book(this);
    }

    public void release() {
        state.release(this);
    }

    public boolean isLockExpired(Instant now) {
        return status == SeatStatus.LOCKED && lockedUntil != null
                && !Instant.parse(lockedUntil).isAfter(now);
    }
}
