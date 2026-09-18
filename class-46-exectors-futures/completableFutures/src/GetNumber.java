import java.util.function.Supplier;

public class GetNumber implements Supplier<Integer> {


    @Override
    public Integer get() {
        return 10;
    }
}
