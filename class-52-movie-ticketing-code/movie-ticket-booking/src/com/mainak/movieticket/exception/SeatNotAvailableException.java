package com.mainak.movieticket.exception;

public class SeatNotAvailableException extends IllegalStateException {

    public SeatNotAvailableException(String message) {
        super(message);
    }
}
