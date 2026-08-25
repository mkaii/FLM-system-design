package model.spot;

import state.AvailableState;
import state.IState;

public class HeavySpot extends CommonSpot {

    @Override
    public SpotSize getSize() {
        return SpotSize.HEAVY;
    }


}
