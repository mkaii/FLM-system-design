package com.mainak.movieticket.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class Show {

    private String id;
    private Movie movie;
    private Screen screen;
    private String startTime;
    private String endTime;
    private Map<String, ShowSeat> showSeats;

}
