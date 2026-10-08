package com.mainak.productcache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    // ---------- Step 1: no cache. Every call goes to the (slow) database ----------
    public Product getProductNoCache(Long id) {
        return readFromDatabase(id);
    }

    // ---------- Step 2: cache-aside by hand, with RedisTemplate ----------
    public Product getProductManual(Long id) {
        String key = "product:" + id;

        // 1. look in Redis first
        Product cached = (Product) redisTemplate.opsForValue().get(key);
        if (cached != null) {
            System.out.println("CACHE HIT  -> " + key);
            return cached;
        }

        // 2. not there: ask the database
        System.out.println("CACHE MISS -> " + key);
        Product product = readFromDatabase(id);

        // 3. keep a copy in Redis for 60 seconds   (same as: SET product:1 '{...}' EX 60)
        if (product != null) {
            redisTemplate.opsForValue().set(key, product, Duration.ofSeconds(60));
        }
        return product;
    }

    // ---------- Step 3: the same thing with one annotation ----------
    // cacheNames = "product" -> the name of the cache (also written value = "product", same thing)
    // key = "#id"            -> which entry: the id parameter
    // the value stored       -> whatever this method returns (the Product)
    // Spring checks Redis for key "product::<id>". Hit: the method does not even run.
    // Miss: the method runs, and Spring stores the result in Redis.
    @Cacheable(cacheNames = "product", key = "#id")
    public Product getProductCached(Long id) {
        System.out.println("CACHE MISS -> product::" + id + "  (method body runs)");
        return readFromDatabase(id);
    }

    // ---------- Step 4: update. Without eviction, the cache keeps the OLD price ----------
    @CacheEvict(cacheNames = "product", key = "#id")   // deletes product::<id> from Redis
    public Product updateProduct(Long id, Product product) {
        product.setId(id);
        Product saved = productRepository.save(product);

        redisTemplate.delete("product:" + id);   // the manual cache must be cleared by hand
        System.out.println("UPDATED    -> cache entries for product " + id + " deleted");
        return saved;
    }

    // Pretend the database is slow (a big query, a busy server...)
    private Product readFromDatabase(Long id) {
        System.out.println("DATABASE   -> reading product " + id + " (takes 2 s)");
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return productRepository.getProductById(id);
    }
}
