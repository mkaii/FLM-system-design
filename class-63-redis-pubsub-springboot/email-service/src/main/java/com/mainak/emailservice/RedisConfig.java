package com.mainak.emailservice;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

// Subscriber side: "when a message arrives on channel orders, call EmailListener.onMessage"
// Same as typing in redis-cli:  SUBSCRIBE orders
@Configuration
public class RedisConfig {

    @Bean
    public RedisMessageListenerContainer listenerContainer(RedisConnectionFactory connectionFactory,
                                                           EmailListener emailListener) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(emailListener, new ChannelTopic("orders"));
        return container;
    }
}
