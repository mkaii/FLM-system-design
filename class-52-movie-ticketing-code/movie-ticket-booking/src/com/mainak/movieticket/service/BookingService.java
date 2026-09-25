package com.mainak.movieticket.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import com.mainak.movieticket.Model.Booking;
import com.mainak.movieticket.Model.BookingStatus;
import com.mainak.movieticket.Model.Payment;
import com.mainak.movieticket.Model.PaymentStatus;
import com.mainak.movieticket.Model.SeatStatus;
import com.mainak.movieticket.Model.Show;
import com.mainak.movieticket.Model.ShowSeat;
import com.mainak.movieticket.Model.User;
import com.mainak.movieticket.exception.InvalidStateTransitionException;
import com.mainak.movieticket.exception.SeatNotAvailableException;
import com.mainak.movieticket.locking.SeatLockManager;
import com.mainak.movieticket.payment.MockPaymentStrategy;
import com.mainak.movieticket.pricing.PricingStrategy;
import com.mainak.movieticket.pricing.RegularPricingStrategy;
import com.mainak.movieticket.repository.BookingRepository;
import com.mainak.movieticket.repository.InMemoryBookingRepository;

/** Coordinates the booking workflow; domain state itself remains framework-free. */
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowService showService;
    private final SeatLockManager seatLockManager;
    private final PricingStrategy pricingStrategy;
    private final PaymentService paymentService;
    private final Duration lockDuration;
    private final AtomicInteger bookingCounter = new AtomicInteger();
    private final AtomicInteger paymentCounter = new AtomicInteger();

    public BookingService(ShowService showService) {
        this.bookingRepository = new InMemoryBookingRepository();
        this.showService = showService;
        this.seatLockManager = new SeatLockManager();
        this.pricingStrategy = new RegularPricingStrategy();
        this.paymentService = new PaymentService(new MockPaymentStrategy());
        this.lockDuration = Duration.ofMinutes(5);
    }

    /**
     * <ul><li>Validates selected seats, locks them briefly, and creates a pending booking.</li></ul>
     */
    public Booking lockSeats(String showId, List<String> seatIds, String userId) {
        Show show = requireShow(showId);
        if (seatIds == null || seatIds.isEmpty()) {
            throw new IllegalArgumentException("At least one seat must be selected");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User id is required");
        }

        Set<String> uniqueSeatIds = new HashSet<>(seatIds);
        if (uniqueSeatIds.size() != seatIds.size()) {
            throw new IllegalArgumentException("A seat can be selected only once");
        }

        List<ShowSeat> selectedSeats = new ArrayList<>();
        List<String> lockKeys = new ArrayList<>();
        for (String seatId : seatIds) {
            ShowSeat showSeat = show.getShowSeats().get(seatId);
            if (showSeat == null) {
                throw new SeatNotAvailableException("Seat " + seatId + " does not exist for this show");
            }
            selectedSeats.add(showSeat);
            lockKeys.add(buildLockKey(showSeat));
        }

        return seatLockManager.executeWhileSeatLocksHeld(lockKeys, () -> {
            Instant now = Instant.now();
            for (ShowSeat showSeat : selectedSeats) {
                releaseIfExpired(showSeat, now);
                if (showSeat.getStatus() != SeatStatus.AVAILABLE) {
                    throw new SeatNotAvailableException("Seat " + showSeat.getSeat().getId()
                            + " is not available");
                }
            }

            Instant expiresAt = now.plus(lockDuration);
            double totalAmount = 0.0;
            for (ShowSeat showSeat : selectedSeats) {
                showSeat.lock(userId, expiresAt);
                totalAmount += pricingStrategy.calculatePrice(showSeat, show);
            }

            User user = new User(userId, userId, userId + "@example.com");
            Booking booking = new Booking(generateBookingId(), user, new ArrayList<>(selectedSeats),
                    BookingStatus.PENDING, totalAmount, now.toString(), PaymentStatus.INITIATED);
            bookingRepository.save(booking);
            return booking;
        });
    }

    /**
     * <ul><li>Processes payment and releases seats if the payment fails.</li></ul>
     */
    public Payment pay(String bookingId) {
        Booking booking = requireBooking(bookingId);
        return seatLockManager.executeWhileSeatLocksHeld(lockKeysFor(booking), () -> {
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw new InvalidStateTransitionException("Only pending bookings can be paid for");
            }
            if (booking.getPaymentStatus() == PaymentStatus.SUCCESS) {
                throw new InvalidStateTransitionException("Booking has already been paid for");
            }
            ensureSeatsStillLockedByBooking(booking, Instant.now());

            boolean success = paymentService.processPayment(booking.getTotalAmount());
            PaymentStatus paymentStatus = success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
            booking.setPaymentStatus(paymentStatus);
            if (!success) {
                releaseBookingSeats(booking);
                booking.setStatus(BookingStatus.CANCELLED);
            }
            bookingRepository.save(booking);
            return new Payment(generatePaymentId(), booking, booking.getTotalAmount(), paymentStatus);
        });
    }

    /**
     * <ul><li>Turns successfully paid, locked seats into permanently booked seats.</li></ul>
     */
    public Booking confirm(String bookingId) {
        Booking booking = requireBooking(bookingId);
        return seatLockManager.executeWhileSeatLocksHeld(lockKeysFor(booking), () -> {
            if (booking.getStatus() != BookingStatus.PENDING || booking.getPaymentStatus() != PaymentStatus.SUCCESS) {
                throw new InvalidStateTransitionException("A pending booking with successful payment is required");
            }
            ensureSeatsStillLockedByBooking(booking, Instant.now());
            for (ShowSeat showSeat : booking.getShowSeats()) {
                showSeat.book();
            }
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
            return booking;
        });
    }

    public Booking getBooking(String bookingId) {
        return requireBooking(bookingId);
    }

    private void ensureSeatsStillLockedByBooking(Booking booking, Instant now) {
        for (ShowSeat showSeat : booking.getShowSeats()) {
            releaseIfExpired(showSeat, now);
            if (showSeat.getStatus() != SeatStatus.LOCKED
                    || !booking.getUser().getId().equals(showSeat.getLockedBy())) {
                releaseBookingSeats(booking);
                booking.setStatus(BookingStatus.EXPIRED);
                bookingRepository.save(booking);
                throw new SeatNotAvailableException("A seat lock has expired or is no longer owned by this booking");
            }
        }
    }

    private void releaseIfExpired(ShowSeat showSeat, Instant now) {
        if (showSeat.isLockExpired(now)) {
            showSeat.release();
        }
    }

    private void releaseBookingSeats(Booking booking) {
        for (ShowSeat showSeat : booking.getShowSeats()) {
            if (showSeat.getStatus() == SeatStatus.LOCKED) {
                showSeat.release();
            }
        }
    }

    private List<String> lockKeysFor(Booking booking) {
        List<String> keys = new ArrayList<>();
        for (ShowSeat showSeat : booking.getShowSeats()) {
            keys.add(buildLockKey(showSeat));
        }
        return keys;
    }

    /**
     * <ul><li>Finds the requested show and stops the flow if it does not exist.</li></ul>
     */
    private Show requireShow(String showId) {
        Show show = showService.getShowById(showId);
        if (show == null || show.getShowSeats() == null) {
            throw new IllegalArgumentException("Show " + showId + " does not exist");
        }
        return show;
    }

    private Booking requireBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId);
        if (booking == null) {
            throw new IllegalArgumentException("Booking " + bookingId + " does not exist");
        }
        return booking;
    }

    private String buildLockKey(ShowSeat showSeat) {
        return "SHOW_" + showSeat.getShow().getId() + "_SEAT_" + showSeat.getSeat().getId();
    }

    private String generateBookingId() {
        return "BOOKING_" + bookingCounter.incrementAndGet();
    }

    private String generatePaymentId() {
        return "PAYMENT_" + paymentCounter.incrementAndGet();
    }
}
