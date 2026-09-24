package com.mainak.movieticket.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class Theatre {

    private String id;
    private String name;
    private String location;
    private List<Screen> screens;

}
