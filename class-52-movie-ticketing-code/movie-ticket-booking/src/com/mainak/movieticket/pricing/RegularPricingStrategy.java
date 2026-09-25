package com.mainak.movieticket.pricing;

import com.mainak.movieticket.Model.SeatType;
import com.mainak.movieticket.Model.Show;
import com.mainak.movieticket.Model.ShowSeat;

import java.util.Map;

public class RegularPricingStrategy implements PricingStrategy {

    private static final Map<SeatType, Integer> PRICES = Map.of(
            SeatType.REGULAR, 200,
            SeatType.PREMIUM, 300,
            SeatType.RECLINER, 500
    );

    /**
     * <ul><li>Returns the standard price for the selected seat type.</li></ul>
     */
    public double calculatePrice(ShowSeat showSeat, Show show) {
        return PRICES.get(showSeat.getSeat().getSeatType());
    }
}
