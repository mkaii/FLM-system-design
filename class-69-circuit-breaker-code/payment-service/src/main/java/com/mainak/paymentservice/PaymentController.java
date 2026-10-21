package com.mainak.paymentservice;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// The service being called. It knows nothing about circuit breakers.
// POST /chaos lets us make it healthy, failing or slow during the demo.
@RestController
public class PaymentController {

    private String mode = "ok";      // ok | fail | slow
    private int callCount = 0;       // how many calls actually reached this service

    // POST /pay?orderId=1
    @PostMapping("/pay")
    public ResponseEntity<String> pay(@RequestParam int orderId) throws InterruptedException {
        callCount++;
        System.out.println("PAYMENT SERVICE  -> call #" + callCount + " for order " + orderId + " (mode: " + mode + ")");

        if (mode.equals("fail")) {
            return ResponseEntity.status(500).body("payment failed for order " + orderId);
        }
        if (mode.equals("slow")) {
            Thread.sleep(3000);      // 3 seconds: slower than the breaker's 2 s "slow call" limit
        }
        return ResponseEntity.ok("payment done for order " + orderId);
    }

    // POST /chaos?mode=fail   (or ok, or slow)
    @PostMapping("/chaos")
    public String chaos(@RequestParam String mode) {
        this.mode = mode;
        System.out.println("PAYMENT SERVICE  -> mode is now " + mode);
        return "payment-service mode: " + mode;
    }
}
