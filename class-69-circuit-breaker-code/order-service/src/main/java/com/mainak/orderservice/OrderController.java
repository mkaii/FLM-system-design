package com.mainak.orderservice;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {

    @Autowired
    private PaymentClient paymentClient;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    // POST /orders?orderId=1          circuit breaker only
    @PostMapping("/orders")
    public String placeOrder(@RequestParam int orderId) {
        String result = paymentClient.pay(orderId);
        return result + "   [breaker: " + state() + "]";
    }

    // POST /orders-with-retry?orderId=1   retry + circuit breaker
    @PostMapping("/orders-with-retry")
    public String placeOrderWithRetry(@RequestParam int orderId) {
        String result = paymentClient.payWithRetry(orderId);
        return result + "   [breaker: " + state() + "]";
    }

    // GET /breaker   the breaker's state and the numbers it decides on
    @GetMapping("/breaker")
    public String breaker() {
        CircuitBreaker breaker = circuitBreakerRegistry.circuitBreaker("payment");
        CircuitBreaker.Metrics metrics = breaker.getMetrics();
        return "state: " + breaker.getState()
                + " | calls in window: " + metrics.getNumberOfBufferedCalls()
                + " | failed: " + metrics.getNumberOfFailedCalls()
                + " | slow: " + metrics.getNumberOfSlowCalls()
                + " | failure rate: " + metrics.getFailureRate() + "%"
                + " | slow rate: " + metrics.getSlowCallRate() + "%"
                + " | rejected while OPEN: " + metrics.getNumberOfNotPermittedCalls()
                + "   (rate -1 = not enough calls yet)";
    }

    private String state() {
        return circuitBreakerRegistry.circuitBreaker("payment").getState().toString();
    }
}
