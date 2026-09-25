package com.mainak.movieticket.repository;

import com.mainak.movieticket.Model.Booking;

public interface BookingRepository {

    Booking findById(String id);

    void save(Booking booking);
}
