package com.mainak.deliveryservice;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.stereotype.Component;

@Component
public class DeliveryListener implements MessageListener {

    // Subscriber side: the message arrives as bytes. This turns JSON bytes back into an Order.
    private JacksonJsonRedisSerializer<Order> serializer = new JacksonJsonRedisSerializer<>(Order.class);

    // Spring calls this every time a message arrives on the channel we subscribed to
    @Override
    public void onMessage(Message message, byte[] pattern) {
        Order order = serializer.deserialize(message.getBody());

        // in a real app: a maps service would pick the nearest rider here
        System.out.println("DELIVERY SERVICE   -> rider assigned for order " + order.getId()
                + ": pick up from " + order.getRestaurant() + ", deliver to " + order.getAddress());
    }
}
