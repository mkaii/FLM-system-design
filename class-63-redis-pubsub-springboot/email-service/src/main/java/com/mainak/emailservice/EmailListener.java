package com.mainak.emailservice;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.stereotype.Component;

@Component
public class EmailListener implements MessageListener {

    // Subscriber side: the message arrives as bytes. This turns JSON bytes back into an Order.
    private JacksonJsonRedisSerializer<Order> serializer = new JacksonJsonRedisSerializer<>(Order.class);

    // Spring calls this every time a message arrives on the channel we subscribed to
    @Override
    public void onMessage(Message message, byte[] pattern) {
        Order order = serializer.deserialize(message.getBody());

        System.out.println("EMAIL SERVICE      -> sending confirmation to " + order.getCustomer()
                + ": your " + order.getItem() + " (order " + order.getId() + ") is confirmed");
    }
}
