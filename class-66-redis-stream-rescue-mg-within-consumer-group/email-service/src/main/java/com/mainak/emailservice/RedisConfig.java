package com.mainak.emailservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;

@Configuration
public class RedisConfig {

    // this copy's name inside the group, from application.properties (email-1 by default)
    @Value("${app.consumer-name}")
    private String consumerName;

    @Bean
    public StreamMessageListenerContainer<String, MapRecord<String, String, String>> listenerContainer(
            RedisConnectionFactory connectionFactory,
            StringRedisTemplate redisTemplate,
            EmailListener emailListener) {

        // 1. make sure the consumer group exists   (XGROUP CREATE orders email 0 MKSTREAM)
        try {
            redisTemplate.opsForStream().createGroup("orders", ReadOffset.from("0"), "email");
        } catch (Exception e) {
            // the group is already there from an earlier run: nothing to do
        }

        // 2. the container reads the stream in the background and calls the listener
        StreamMessageListenerContainer<String, MapRecord<String, String, String>> container =
                StreamMessageListenerContainer.create(connectionFactory);

        // 3. read as one consumer of group "email", and ask for entries the group has not been given yet
        //    (XREADGROUP GROUP email <consumerName> STREAMS orders >)
        container.receive(
                Consumer.from("email", consumerName),
                StreamOffset.create("orders", ReadOffset.lastConsumed()),
                emailListener);

        container.start();
        return container;
    }
}
