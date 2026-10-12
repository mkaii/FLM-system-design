package com.mainak.restaurantservice;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

// Subscriber side: "when a message arrives on channel orders, call RestaurantListener.onMessage"
// Same as typing in redis-cli:  SUBSCRIBE orders
@Configuration
public class RedisConfig {

    @Bean
    public RedisMessageListenerContainer listenerContainer(RedisConnectionFactory connectionFactory,
                                                           RestaurantListener restaurantListener) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(restaurantListener, new ChannelTopic("orders"));
        return container;
    }
}
