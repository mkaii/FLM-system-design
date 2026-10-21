package com.mainak.orderservice;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

// Calls payment-service. The circuit breaker lives HERE, in the caller.
@Service
public class PaymentClient {

    private final RestClient restClient = RestClient.create("http://localhost:9031");

    // 1. Circuit breaker only.
    //    CLOSED: call payment-service.   OPEN: don't call it, go straight to fallback.
    @CircuitBreaker(name = "payment", fallbackMethod = "fallback")
    public String pay(int orderId) {
        return callPaymentService(orderId);
    }

    // 2. Retry around the circuit breaker: one request can try payment-service up to 3 times.
    //    Every attempt is counted in the breaker's window.
    @Retry(name = "payment", fallbackMethod = "fallback")
    @CircuitBreaker(name = "payment")
    public String payWithRetry(int orderId) {
        return callPaymentService(orderId);
    }

    private String callPaymentService(int orderId) {
        System.out.println("ORDER SERVICE    -> calling payment-service for order " + orderId);
        return restClient.post()
                .uri("/pay?orderId=" + orderId)
                .retrieve()
                .body(String.class);
    }

    // Runs instead of throwing an error: same parameters as the method, plus the error.
    public String fallback(int orderId, Throwable error) {
        if (error instanceof CallNotPermittedException) {
            return "FALLBACK: circuit is OPEN, payment-service was NOT called. Order " + orderId + " saved as PENDING";
        }
        return "FALLBACK: payment failed (" + error.getClass().getSimpleName() + "). Order " + orderId + " saved as PENDING";
    }
}
