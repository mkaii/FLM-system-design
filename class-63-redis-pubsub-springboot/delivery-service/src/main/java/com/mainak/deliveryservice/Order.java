package com.mainak.deliveryservice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// The payload that travels on the channel, as JSON.
// Every service keeps its own copy of this class: services share the message format, not the code.
@Getter
@Setter
@NoArgsConstructor
public class Order {

    private Long id;
    private String item;
    private String customer;
    private String restaurant;
    private String address;
}
