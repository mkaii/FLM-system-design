package com.mainak.movieticket.service;

import java.util.List;

import com.mainak.movieticket.Model.Movie;
import com.mainak.movieticket.repository.InMemoryMovieRepository;
import com.mainak.movieticket.repository.MovieRepository;

public class MovieService {

    private MovieRepository movieRepository;

    public MovieService() {
        movieRepository = new InMemoryMovieRepository();
        movieRepository.save(new Movie("M1", "Interstellar", 169, "English", "Sci-Fi"));
    }

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(String id) {
        return movieRepository.findById(id);
    }
}
