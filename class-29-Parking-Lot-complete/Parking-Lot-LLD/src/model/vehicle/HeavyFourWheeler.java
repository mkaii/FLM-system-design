package model.vehicle;

import model.spot.SpotSize;

public class HeavyFourWheeler implements IVehicle {

    @Override
    public SpotSize getSize() {
        return SpotSize.HEAVY;
    }
}
