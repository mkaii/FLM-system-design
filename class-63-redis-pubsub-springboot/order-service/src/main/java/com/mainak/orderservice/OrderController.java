package com.mainak.orderservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {

    @Autowired
    private OrderPublisher orderPublisher;

    // POST /orders
    // body: {"id": 501, "item": "Pizza", "customer": "Zoya", "restaurant": "Pizza Hut", "address": "MG Road, Pune"}
    @PostMapping("/orders")
    public String placeOrder(@RequestBody Order order) {

        // announce it. The order service does not know (or care) who is listening.
        Long receivers = orderPublisher.publish(order);

        System.out.println("ORDER SERVICE      -> order " + order.getId() + " placed, heard by " + receivers + " services");
        return "Order " + order.getId() + " placed. Heard by " + receivers + " services.";
    }
}
