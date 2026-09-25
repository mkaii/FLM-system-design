package com.mainak.movieticket.Model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

import com.mainak.movieticket.Model.Booking;
import com.mainak.movieticket.Model.ShowSeat;

@Getter
public class BookingResponse {
    private final String id;
    private final String userId;
    private final String bookingStatus;
    private final String paymentStatus;
    private final double totalAmount;
    private final List<String> seatIds;

    /**
     * <ul><li>Converts an internal booking into the smaller response returned by the API.</li></ul>
     */
    public BookingResponse(Booking booking) {
        id = booking.getId();
        userId = booking.getUser().getId();
        bookingStatus = booking.getStatus().name();
        paymentStatus = booking.getPaymentStatus().name();
        totalAmount = booking.getTotalAmount();
        seatIds = new ArrayList<>();
        for (ShowSeat showSeat : booking.getShowSeats()) {
            seatIds.add(showSeat.getSeat().getId());
        }
    }
}
