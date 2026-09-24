package com.mainak.movieticket;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.mainak.movieticket.domain.Booking;
import com.mainak.movieticket.domain.Movie;
import com.mainak.movieticket.domain.Payment;
import com.mainak.movieticket.domain.Screen;
import com.mainak.movieticket.domain.Seat;
import com.mainak.movieticket.domain.SeatType;
import com.mainak.movieticket.domain.Show;
import com.mainak.movieticket.domain.ShowSeat;
import com.mainak.movieticket.domain.Theatre;
import com.mainak.movieticket.locking.SeatLockManager;
import com.mainak.movieticket.payment.MockPaymentStrategy;
import com.mainak.movieticket.payment.PaymentStrategy;
import com.mainak.movieticket.pricing.PricingStrategy;
import com.mainak.movieticket.pricing.RegularPricingStrategy;
import com.mainak.movieticket.repository.BookingRepository;
import com.mainak.movieticket.repository.InMemoryBookingRepository;
import com.mainak.movieticket.repository.InMemoryMovieRepository;
import com.mainak.movieticket.repository.InMemoryShowRepository;
import com.mainak.movieticket.repository.MovieRepository;
import com.mainak.movieticket.repository.ShowRepository;
import com.mainak.movieticket.service.BookingService;
import com.mainak.movieticket.service.PaymentService;
import com.mainak.movieticket.service.ShowService;

public class Main {

    public static void main(String[] args) {

        Movie movie = new Movie("M1", "Interstellar", 169, "English", "Sci-Fi");

        Seat seat1 = new Seat("S1", "A1", SeatType.REGULAR);
        Seat seat2 = new Seat("S2", "A2", SeatType.PREMIUM);
        List<Seat> seats = new ArrayList<>();
        seats.add(seat1);
        seats.add(seat2);

        Screen screen = new Screen("SCR1", "Screen 1", seats);

        List<Screen> screens = new ArrayList<>();
        screens.add(screen);
        Theatre theatre = new Theatre("T1", "PVR", "Bangalore", screens);

        Map<String, ShowSeat> showSeats = new HashMap<>();
        Show show = new Show("SHOW101", movie, screen, "2026-09-23T18:00", "2026-09-23T21:00", showSeats);
        for (Seat seat : screen.getSeats()) {
            showSeats.put(seat.getId(), new ShowSeat(show, seat));
        }

        MovieRepository movieRepository = new InMemoryMovieRepository();
        movieRepository.save(movie);

        ShowRepository showRepository = new InMemoryShowRepository();
        showRepository.save(show);

        BookingRepository bookingRepository = new InMemoryBookingRepository();

        SeatLockManager seatLockManager = new SeatLockManager();
        PricingStrategy pricingStrategy = new RegularPricingStrategy();
        PaymentStrategy paymentStrategy = new MockPaymentStrategy();
        PaymentService paymentService = new PaymentService(paymentStrategy);
        ShowService showService = new ShowService(showRepository);

        BookingService bookingService = new BookingService(bookingRepository, showService,
                seatLockManager, pricingStrategy, paymentService);

        List<String> seatIdsToBook = new ArrayList<>();
        seatIdsToBook.add("S1");

        Booking booking = bookingService.lockSeats("SHOW101", seatIdsToBook, "USER1");
        System.out.println("Locked booking: " + booking.getId() + " status=" + booking.getStatus()
                + " amount=" + booking.getTotalAmount());

        Payment payment = bookingService.pay(booking.getId());
        System.out.println("Payment status: " + payment.getStatus());

        Booking confirmed = bookingService.confirm(booking.getId());
        System.out.println("Booking status after confirm: " + confirmed.getStatus());

        for (ShowSeat showSeat : show.getShowSeats().values()) {
            System.out.println("Seat " + showSeat.getSeat().getSeatNumber() + " -> " + showSeat.getStatus());
        }
    }
}
