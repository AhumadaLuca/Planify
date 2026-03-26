package com.eventos.eventos_app.services;

import org.springframework.stereotype.Service;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bandwidth;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimit {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String key, int capacidad, int minutos) {
        return cache.computeIfAbsent(key, k -> 
            Bucket.builder()
                .addLimit(Bandwidth.simple(capacidad, Duration.ofMinutes(minutos)))
                .build()
        );
    }
}