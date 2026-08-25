package model.vehicle;

import model.spot.SpotSize;

public class FourWheeler implements IVehicle {

    @Override
    public SpotSize getSize() {
        return SpotSize.LARGE;
    }
}
