package com.mainak.movieticket.Model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class LockSeatsRequest {
    private String showId;
    private List<String> seatIds;
    private String userId;

}
