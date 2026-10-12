package com.mainak.restaurantservice;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.stereotype.Component;

@Component
public class RestaurantListener implements MessageListener {

    // Subscriber side: the message arrives as bytes. This turns JSON bytes back into an Order.
    private JacksonJsonRedisSerializer<Order> serializer = new JacksonJsonRedisSerializer<>(Order.class);

    // Spring calls this every time a message arrives on the channel we subscribed to
    @Override
    public void onMessage(Message message, byte[] pattern) {
        Order order = serializer.deserialize(message.getBody());

        System.out.println("RESTAURANT SERVICE -> telling " + order.getRestaurant()
                + " to start preparing " + order.getItem() + " (order " + order.getId() + ")");
    }
}
