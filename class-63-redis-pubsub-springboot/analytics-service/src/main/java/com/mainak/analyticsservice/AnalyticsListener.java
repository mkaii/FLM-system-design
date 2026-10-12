package com.mainak.analyticsservice;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsListener implements MessageListener {

    // Subscriber side: the message arrives as bytes. This turns JSON bytes back into an Order.
    private JacksonJsonRedisSerializer<Order> serializer = new JacksonJsonRedisSerializer<>(Order.class);

    private int ordersToday = 0;

    // Spring calls this every time a message arrives on the channel we subscribed to
    @Override
    public void onMessage(Message message, byte[] pattern) {
        Order order = serializer.deserialize(message.getBody());

        ordersToday = ordersToday + 1;
        System.out.println("ANALYTICS SERVICE  -> orders today: " + ordersToday
                + " (latest: " + order.getItem() + " from " + order.getRestaurant() + ")");
    }
}
