package com.mainak.productcache;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;

import java.time.Duration;

@Configuration
public class RedisConfig {

    // ---------- 1. For RedisTemplate (manual cache-aside) ----------
    // Without the two serializer lines, RedisTemplate falls back to Java serialization.
    // Try it in class:
    //   1. comment out the two template.set...Serializer lines below
    //      -> GET /products/1/manual fails with "Cannot serialize" (Product is not Serializable)
    //   2. add "implements java.io.Serializable" to Product and call it again
    //      -> works, but in Redis Insight the key is "\xac\xed\x00\x05t\x00\tproduct:1"
    //         and "GET product:1" returns (nil): the data is there, under an unreadable key
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        template.setKeySerializer(RedisSerializer.string());   // key   -> plain text: product:1
        template.setValueSerializer(RedisSerializer.json());   // value -> JSON: {"id":1,"name":"Phone",...}

        return template;
    }

    // ---------- 2. For @Cacheable ----------
    // Every cached entry: stored as JSON, deleted automatically after 60 seconds.
    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig();
        config = config.entryTtl(Duration.ofSeconds(60));
        config = config.serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(RedisSerializer.json()));
        return config;
    }
}
