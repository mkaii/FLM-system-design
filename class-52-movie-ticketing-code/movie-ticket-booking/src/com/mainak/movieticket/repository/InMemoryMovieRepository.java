package com.mainak.movieticket.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.mainak.movieticket.domain.Movie;

public class InMemoryMovieRepository implements MovieRepository {

    private Map<String, Movie> movies = new ConcurrentHashMap<>();

    public Movie findById(String id) {
        return movies.get(id);
    }

    public List<Movie> findAll() {
        return new ArrayList<>(movies.values());
    }

    public void save(Movie movie) {
        movies.put(movie.getId(), movie);
    }
}
