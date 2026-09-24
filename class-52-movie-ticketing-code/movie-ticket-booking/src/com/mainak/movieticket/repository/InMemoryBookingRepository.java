package com.mainak.movieticket.repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.mainak.movieticket.domain.Booking;

public class InMemoryBookingRepository implements BookingRepository {

    private Map<String, Booking> bookings = new ConcurrentHashMap<>();

    public Booking findById(String id) {
        return bookings.get(id);
    }

    public void save(Booking booking) {
        bookings.put(booking.getId(), booking);
    }
}
