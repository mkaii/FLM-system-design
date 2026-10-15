package com.mainak.emailservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.PendingMessage;
import org.springframework.data.redis.connection.stream.PendingMessages;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

// Takes over entries that another copy of email-service was given but never acknowledged (it crashed).
// Every copy runs this, so whichever copy is alive rescues the others.
//
// Timing: STUCK_AFTER (60 s) + the 30 s schedule -> a stuck entry is rescued 60 to 90 s after it was handed out.
// There is no TTL: entries never expire.
//
// HOW TO TEST (Postman requests 4a, 4b, 4c)
//   Setup: email-1 started in DEBUG mode (bug icon). email-2 started with RUN, not Debug,
//          args --server.port=9023 --app.consumer-name=email-2   (a Run copy ignores breakpoints)
//   a. Crash before sending: breakpoint on the println in EmailListener. Send until email-1 pauses.
//      Press Stop on email-1 within 60 s. -> 60-90 s later email-2 prints "rescued entry ..." + the email. Sent once.
//   b. Crash after sending: breakpoint on the acknowledge line in EmailListener. Same steps.
//      -> email-1 printed the email, email-2 prints it again. Sent twice.
//   c. Slow, not dead: breakpoint on the println. Do NOT stop email-1; wait over 90 s, then Resume.
//      -> email-2 rescues it while email-1 is paused, then email-1 prints it too. Sent twice.
//   Check: redis-cli  XPENDING orders email - + 10   (stuck entry and its owner), 0 after the rescue.
@Component
public class PendingRescuer {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private EmailListener emailListener;

    // this copy's name inside the group: the new owner of anything it rescues
    @Value("${app.consumer-name}")
    private String consumerName;

    // an entry pending longer than this counts as stuck. Keep it longer than a normal send takes.
    private static final Duration STUCK_AFTER = Duration.ofSeconds(60);

    // runs every 30 seconds, 30 seconds after the previous run finished
    @Scheduled(fixedDelay = 30000)
    public void rescue() {
        // 1. the group's pending list   (XPENDING orders email - + 10)
        PendingMessages pending = redisTemplate.opsForStream().pending("orders", "email", Range.unbounded(), 10L);

        for (PendingMessage p : pending) {
            // 2. not stuck yet: its owner may still be working on it
            if (p.getElapsedTimeSinceLastDelivery().compareTo(STUCK_AFTER) < 0) {
                continue;
            }

            // 3. take it over   (XCLAIM orders email <me> 60000 <id>)
            //    empty list = another copy claimed it first
            List<MapRecord<String, String, String>> records = redisTemplate.<String, String>opsForStream()
                    .claim("orders", "email", consumerName, STUCK_AFTER, p.getId());

            // 4 + 5. same work as a new entry: send the email, then XACK (inside onMessage)
            if (!records.isEmpty()) {
                System.out.println("EMAIL SERVICE    -> rescued entry " + p.getId() + " from " + p.getConsumerName());
                emailListener.onMessage(records.get(0));
            }
        }
    }
}
