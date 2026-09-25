package com.mainak.movieticket.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.mainak.movieticket.Model.Show;

public class InMemoryShowRepository implements ShowRepository {

    private Map<String, Show> shows = new ConcurrentHashMap<>();

    public Show findById(String id) {
        return shows.get(id);
    }

    public List<Show> findByMovieId(String movieId) {
        List<Show> result = new ArrayList<>();

        for (Show show : shows.values()) {
            if (show.getMovie().getId().equals(movieId)) {
                result.add(show);
            }
        }

        return result;
    }

    public void save(Show show) {
        shows.put(show.getId(), show);
    }
}
