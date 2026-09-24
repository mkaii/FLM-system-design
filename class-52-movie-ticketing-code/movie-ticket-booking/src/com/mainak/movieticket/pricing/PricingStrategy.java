package com.mainak.movieticket.pricing;

import com.mainak.movieticket.domain.Show;
import com.mainak.movieticket.domain.ShowSeat;

public interface PricingStrategy {

    double calculatePrice(ShowSeat showSeat, Show show);
}
