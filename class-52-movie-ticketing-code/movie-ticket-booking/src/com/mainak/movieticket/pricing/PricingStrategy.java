package com.mainak.movieticket.pricing;

import com.mainak.movieticket.Model.Show;
import com.mainak.movieticket.Model.ShowSeat;

public interface PricingStrategy {

    double calculatePrice(ShowSeat showSeat, Show show);
}
