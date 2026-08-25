package model.vehicle;

import model.spot.SpotSize;

public class TwoWheeler implements IVehicle {
    @Override
    public SpotSize getSize() {
        return SpotSize.COMPACT;
    }
}
