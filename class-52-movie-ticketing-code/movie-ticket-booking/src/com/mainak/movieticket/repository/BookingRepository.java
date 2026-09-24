package com.mainak.movieticket.repository;

import com.mainak.movieticket.domain.Booking;

public interface BookingRepository {

    Booking findById(String id);

    void save(Booking booking);
}
