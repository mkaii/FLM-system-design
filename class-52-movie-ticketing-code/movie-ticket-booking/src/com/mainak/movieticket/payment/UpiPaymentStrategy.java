package com.mainak.movieticket.payment;

public class UpiPaymentStrategy implements PaymentStrategy {

    public boolean pay(double amount) {
        return true;
    }
}
