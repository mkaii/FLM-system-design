package com.mainak.movieticket.Model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class Screen {

    private String id;
    private String name;
    private List<Seat> seats;

}
