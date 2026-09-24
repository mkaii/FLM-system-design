package com.mainak.movieticket.payment;

public interface PaymentStrategy {

    boolean pay(double amount);
}
