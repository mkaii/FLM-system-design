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
        // in a real app: save the order to the database here

        // write it into the stream. It stays there, whether or not anyone is reading right now.
        String entryId = orderPublisher.publish(order);

        System.out.println("ORDER SERVICE    -> order " + order.getId() + " added to the stream, entry id " + entryId);
        return "Order " + order.getId() + " placed. Stored in the stream as entry " + entryId + ".";
    }
}
