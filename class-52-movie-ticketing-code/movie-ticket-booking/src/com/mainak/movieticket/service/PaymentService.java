package com.mainak.movieticket.service;

import com.mainak.movieticket.payment.PaymentStrategy;

public class PaymentService {

    private PaymentStrategy paymentStrategy;

    public PaymentService(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    public boolean processPayment(double amount) {
        return paymentStrategy.pay(amount);
    }
}
