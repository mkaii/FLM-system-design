package com.mainak.movieticket.Model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class Booking {

    private String id;
    private User user;
    private List<ShowSeat> showSeats;
    private BookingStatus status;
    private double totalAmount;
    private String createdAt;
    private PaymentStatus paymentStatus;

}
