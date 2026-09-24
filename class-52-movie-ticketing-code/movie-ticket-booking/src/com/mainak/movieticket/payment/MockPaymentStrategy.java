package com.mainak.movieticket.payment;

public class MockPaymentStrategy implements PaymentStrategy {

    public boolean pay(double amount) {
        return true;
    }
}
