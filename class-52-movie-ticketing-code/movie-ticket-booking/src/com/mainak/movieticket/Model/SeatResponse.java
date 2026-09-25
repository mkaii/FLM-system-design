package com.mainak.movieticket.Model;

import lombok.Getter;

import com.mainak.movieticket.Model.ShowSeat;

@Getter
public class SeatResponse {
    private final String seatId;
    private final String seatNumber;
    private final String type;
    private final String status;

    public SeatResponse(ShowSeat showSeat) {
        seatId = showSeat.getSeat().getId();
        seatNumber = showSeat.getSeat().getSeatNumber();
        type = showSeat.getSeat().getSeatType().name();
        status = showSeat.getStatus().name();
    }
}
