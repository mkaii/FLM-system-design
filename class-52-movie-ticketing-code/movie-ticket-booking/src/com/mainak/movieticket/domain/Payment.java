package com.mainak.movieticket.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Payment {

    private String id;
    private Booking booking;
    private double amount;
    private PaymentStatus status;

}
