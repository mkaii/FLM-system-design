package com.mainak.productcache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProductController {

    @Autowired
    private ProductService productService;

    // POST /products   body: {"id": 1, "name": "Phone", "price": 999}
    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) {
        return productService.addProduct(product);
    }

    // GET /products/1/no-cache   -> always ~2 s
    @GetMapping("/products/{id}/no-cache")
    public Product getProductNoCache(@PathVariable Long id) {
        return productService.getProductNoCache(id);
    }

    // GET /products/1/manual     -> 2 s the first time, then a few ms (RedisTemplate)
    @GetMapping("/products/{id}/manual")
    public Product getProductManual(@PathVariable Long id) {
        return productService.getProductManual(id);
    }

    // GET /products/1/cached     -> 2 s the first time, then a few ms (@Cacheable)
    @GetMapping("/products/{id}/cached")
    public Product getProductCached(@PathVariable Long id) {
        return productService.getProductCached(id);
    }

    // PUT /products/1   body: {"name": "Phone", "price": 899}
    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }
}
