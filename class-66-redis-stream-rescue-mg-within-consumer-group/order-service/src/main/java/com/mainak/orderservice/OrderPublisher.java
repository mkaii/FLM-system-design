package com.mainak.orderservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class OrderPublisher {

    // Spring Boot creates this for us. A stream entry is made of text fields, so no extra config is needed.
    @Autowired
    private StringRedisTemplate redisTemplate;

    // Same as typing in redis-cli:
    //   XADD orders * id 501 item Pizza customer Zoya restaurant "Pizza Hut" address "MG Road, Pune"
    // Redis stores the entry and replies with its id.
    public String publish(Order order) {
        Map<String, String> fields = new HashMap<>();
        fields.put("id", String.valueOf(order.getId()));
        fields.put("item", order.getItem());
        fields.put("customer", order.getCustomer());
        fields.put("restaurant", order.getRestaurant());
        fields.put("address", order.getAddress());

        RecordId entryId = redisTemplate.opsForStream().add("orders", fields);
        return entryId.getValue();
    }
}
