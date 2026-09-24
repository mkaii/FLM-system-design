package com.mainak.movieticket.repository;

import java.util.List;

import com.mainak.movieticket.domain.Movie;

public interface MovieRepository {

    Movie findById(String id);

    List<Movie> findAll();

    void save(Movie movie);
}
