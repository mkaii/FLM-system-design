package com.mainak.movieticket.payment;

public class CardPaymentStrategy implements PaymentStrategy {

    public boolean pay(double amount) {
        return true;
    }
}
