package com.mainak.orderservice;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;

// Publisher side: we send an Order OBJECT, and Redis only carries bytes.
// So, like class 61, we need a serializer: Order -> JSON bytes.
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Order> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Order> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        template.setKeySerializer(RedisSerializer.string());
        template.setValueSerializer(new JacksonJsonRedisSerializer<>(Order.class));

        return template;
    }
}
