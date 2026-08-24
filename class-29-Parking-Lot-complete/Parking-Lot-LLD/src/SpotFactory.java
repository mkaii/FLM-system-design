import java.util.HashMap;
import java.util.Map;

public class SpotFactory {

    private static final Map<SpotSize,ISpot> strategies = new HashMap<>();


    //mapping
    static {
        strategies.put(SpotSize.COMPACT,new CompactSpot());
        strategies.put(SpotSize.LARGE,new LargeSpot());
        strategies.put(SpotSize.HEAVY,new HeavySpot());
    }

    // what the unpark method would be using
    public ISpot getSpot(SpotSize spotSize) {
        return strategies.get(spotSize);
    }
}
