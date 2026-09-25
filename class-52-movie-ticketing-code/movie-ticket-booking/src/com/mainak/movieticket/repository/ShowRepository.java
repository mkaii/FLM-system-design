package com.mainak.movieticket.repository;

import java.util.List;

import com.mainak.movieticket.Model.Show;

public interface ShowRepository {

    Show findById(String id);

    List<Show> findByMovieId(String movieId);

    void save(Show show);
}
