package com.mainak.orderservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderPublisher {

    @Autowired
    private RedisTemplate<String, Order> redisTemplate;

    // Same as typing in redis-cli:  PUBLISH orders '{"id":501,"item":"Pizza",...}'
    // The reply is the number of subscribers that received the message.
    public Long publish(Order order) {
        return redisTemplate.convertAndSend("orders", order);
    }
}
