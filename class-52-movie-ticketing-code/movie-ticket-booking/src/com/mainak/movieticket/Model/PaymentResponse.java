package com.mainak.movieticket.Model;

import lombok.Getter;

import com.mainak.movieticket.Model.Payment;

@Getter
public class PaymentResponse {
    private final String id;
    private final String bookingId;
    private final double amount;
    private final String status;

    public PaymentResponse(Payment payment) {
        id = payment.getId();
        bookingId = payment.getBooking().getId();
        amount = payment.getAmount();
        status = payment.getStatus().name();
    }
}
