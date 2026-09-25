package com.mainak.movieticket.pricing;

import com.mainak.movieticket.Model.SeatType;
import com.mainak.movieticket.Model.Show;
import com.mainak.movieticket.Model.ShowSeat;

import java.util.Map;

public class WeekendPricingStrategy implements PricingStrategy {

    private static final Map<SeatType, Integer> PRICES = Map.of(
            SeatType.REGULAR, 200,
            SeatType.PREMIUM, 300,
            SeatType.RECLINER, 500
    );

    public double calculatePrice(ShowSeat showSeat, Show show) {
        return PRICES.get(showSeat.getSeat().getSeatType()) * 1.2;
    }
}
