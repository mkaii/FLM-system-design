package com.mainak.movieticket.service;

import java.util.ArrayList;
import java.util.List;

import com.mainak.movieticket.Model.Show;
import com.mainak.movieticket.Model.ShowSeat;
import com.mainak.movieticket.Model.Movie;
import com.mainak.movieticket.Model.Screen;
import com.mainak.movieticket.Model.Seat;
import com.mainak.movieticket.Model.SeatType;
import com.mainak.movieticket.repository.InMemoryShowRepository;
import com.mainak.movieticket.repository.ShowRepository;

import java.util.Arrays;
import java.util.HashMap;

public class ShowService {

    private ShowRepository showRepository;

    public ShowService() {
        showRepository = new InMemoryShowRepository();
        Movie movie = new Movie("M1", "Interstellar", 169, "English", "Sci-Fi");
        Screen screen = new Screen("SCR1", "Screen 1", Arrays.asList(
                new Seat("S1", "A1", SeatType.REGULAR),
                new Seat("S2", "A2", SeatType.PREMIUM),
                new Seat("S3", "A3", SeatType.RECLINER)));
        HashMap<String, ShowSeat> showSeats = new HashMap<>();
        Show show = new Show("SHOW101", movie, screen, "2026-09-23T18:00", "2026-09-23T21:00", showSeats);
        for (Seat seat : screen.getSeats()) {
            showSeats.put(seat.getId(), new ShowSeat(show, seat));
        }
        showRepository.save(show);
    }

    public ShowService(ShowRepository showRepository) {
        this.showRepository = showRepository;
    }

    public List<Show> getShowsForMovie(String movieId) {
        return showRepository.findByMovieId(movieId);
    }

    /**
     * <ul><li>Retrieves one show so booking logic can inspect its seats.</li></ul>
     */
    public Show getShowById(String showId) {
        return showRepository.findById(showId);
    }

    public List<ShowSeat> getSeatsForShow(String showId) {
        Show show = showRepository.findById(showId);
        if (show == null || show.getShowSeats() == null) {
            throw new IllegalArgumentException("Show " + showId + " does not exist");
        }
        return new ArrayList<>(show.getShowSeats().values());
    }
}
