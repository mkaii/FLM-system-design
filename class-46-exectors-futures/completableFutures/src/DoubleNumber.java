import java.util.function.Function;

public class DoubleNumber implements Function<Integer, Integer> {


    @Override
    public Integer apply(Integer integer) {
        return 2 * integer;
    }
}
