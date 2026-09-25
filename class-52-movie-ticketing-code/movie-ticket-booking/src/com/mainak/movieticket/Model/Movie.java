package com.mainak.movieticket.Model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Movie {

    private String id;
    private String name;
    private int duration;
    private String language;
    private String genre;

}
