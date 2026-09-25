package com.mainak.movieticket.controller;

import java.util.ArrayList;
import java.util.List;

import com.mainak.movieticket.Model.Movie;
import com.mainak.movieticket.Model.Payment;
import com.mainak.movieticket.Model.Show;
import com.mainak.movieticket.Model.ShowSeat;
import com.mainak.movieticket.Model.BookingResponse;
import com.mainak.movieticket.Model.LockSeatsRequest;
import com.mainak.movieticket.Model.PaymentResponse;
import com.mainak.movieticket.Model.SeatResponse;
import com.mainak.movieticket.Model.ShowResponse;
import com.mainak.movieticket.service.BookingService;
import com.mainak.movieticket.service.MovieService;
import com.mainak.movieticket.service.ShowService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class MovieTicketController {

    private final MovieService movieService;
    private final ShowService showService;
    private final BookingService bookingService;

    public MovieTicketController() {
        movieService = new MovieService();
        showService = new ShowService();
        bookingService = new BookingService(showService);
    }

    @GetMapping("/movies")
    public List<Movie> getMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("/movies/{movieId}/shows")
    public List<ShowResponse> getShowsForMovie(@PathVariable String movieId) {
        List<ShowResponse> result = new ArrayList<>();
        for (Show show : showService.getShowsForMovie(movieId)) {
            result.add(new ShowResponse(show));
        }
        return result;
    }

    @GetMapping("/shows/{showId}/seats")
    public List<SeatResponse> getSeatsForShow(@PathVariable String showId) {
        List<SeatResponse> result = new ArrayList<>();
        for (ShowSeat showSeat : showService.getSeatsForShow(showId)) {
            result.add(new SeatResponse(showSeat));
        }
        return result;
    }

    /**
     * <ul><li>Accepts a seat-selection request and returns the newly locked booking.</li></ul>
     */
    @PostMapping("/bookings/lock")
    public BookingResponse lockSeats(@RequestBody LockSeatsRequest request) {
        try {
            return new BookingResponse(bookingService.lockSeats(
                    request.getShowId(), request.getSeatIds(), request.getUserId()));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            throw badRequest(exception);
        }
    }

    /**
     * <ul><li>Accepts payment for an existing pending booking.</li></ul>
     */
    @PostMapping("/bookings/{bookingId}/pay")
    public PaymentResponse pay(@PathVariable String bookingId) {
        try {
            Payment payment = bookingService.pay(bookingId);
            return new PaymentResponse(payment);
        } catch (IllegalArgumentException | IllegalStateException exception) {
            throw badRequest(exception);
        }
    }

    /**
     * <ul><li>Finalizes a successfully paid booking.</li></ul>
     */
    @PostMapping("/bookings/{bookingId}/confirm")
    public BookingResponse confirm(@PathVariable String bookingId) {
        try {
            return new BookingResponse(bookingService.confirm(bookingId));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            throw badRequest(exception);
        }
    }

    @GetMapping("/bookings/{bookingId}")
    public BookingResponse getBooking(@PathVariable String bookingId) {
        try {
            return new BookingResponse(bookingService.getBooking(bookingId));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, exception.getMessage(), exception);
        }
    }

    private ResponseStatusException badRequest(RuntimeException exception) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
    }
}
