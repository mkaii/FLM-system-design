package com.mainak.emailservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EmailListener implements StreamListener<String, MapRecord<String, String, String>> {

    @Autowired
    private StringRedisTemplate redisTemplate;

    // Spring calls this for every stream entry given to this consumer
    @Override
    public void onMessage(MapRecord<String, String, String> record) {
        // 1. the entry arrives as fields; turn them back into an Order
        Map<String, String> fields = record.getValue();
        Order order = new Order();
        order.setId(Long.valueOf(fields.get("id")));
        order.setItem(fields.get("item"));
        order.setCustomer(fields.get("customer"));
        order.setRestaurant(fields.get("restaurant"));
        order.setAddress(fields.get("address"));

        // 2. do the work
        //    CRASH TEST a / c: breakpoint on the println below (email not sent yet). See PendingRescuer.
        System.out.println("EMAIL SERVICE    -> sending confirmation to " + order.getCustomer() + ": your " + order.getItem() + " (order " + order.getId() + ") is confirmed");

        //    CRASH TEST b: breakpoint on the acknowledge line below (email already sent, no XACK yet).
        // 3. tell Redis "done", so the entry leaves this group's pending list   (XACK orders email <id>)
        redisTemplate.opsForStream().acknowledge("orders", "email", record.getId());
    }
}
