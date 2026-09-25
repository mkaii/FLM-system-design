package com.mainak.movieticket.Model;

import lombok.Getter;

import com.mainak.movieticket.Model.Show;

@Getter
public class ShowResponse {
    private final String id;
    private final String movieId;
    private final String screenId;
    private final String startTime;
    private final String endTime;

    public ShowResponse(Show show) {
        id = show.getId();
        movieId = show.getMovie().getId();
        screenId = show.getScreen().getId();
        startTime = show.getStartTime();
        endTime = show.getEndTime();
    }
}
