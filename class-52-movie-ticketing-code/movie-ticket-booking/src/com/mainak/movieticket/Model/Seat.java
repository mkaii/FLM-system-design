package com.mainak.movieticket.Model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Seat {

    private String id;
    private String seatNumber;
    private SeatType seatType;

}
