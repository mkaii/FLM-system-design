package com.mainak.movieticket.exception;

public class InvalidStateTransitionException extends IllegalStateException {

    public InvalidStateTransitionException(String message) {
        super(message);
    }
}
