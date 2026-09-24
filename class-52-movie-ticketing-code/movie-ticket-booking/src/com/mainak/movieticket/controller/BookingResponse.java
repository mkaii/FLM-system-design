package com.mainak.movieticket.controller;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

import com.mainak.movieticket.domain.Booking;
import com.mainak.movieticket.domain.ShowSeat;

@Getter
public class BookingResponse {
    private final String id;
    private final String userId;
    private final String status;
    private final String paymentStatus;
    private final double totalAmount;
    private final List<String> seatIds;

    public BookingResponse(Booking booking) {
        id = booking.getId();
        userId = booking.getUser().getId();
        status = booking.getStatus().name();
        paymentStatus = booking.getPaymentStatus().name();
        totalAmount = booking.getTotalAmount();
        seatIds = new ArrayList<>();
        for (ShowSeat showSeat : booking.getShowSeats()) {
            seatIds.add(showSeat.getSeat().getId());
        }
    }
}
