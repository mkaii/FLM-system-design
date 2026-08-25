package model.spot;

import state.AvailableState;
import state.IState;

public class CompactSpot extends CommonSpot {

    @Override
    public SpotSize getSize() {
        return SpotSize.COMPACT;
    }


}
