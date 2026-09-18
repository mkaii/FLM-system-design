import java.util.function.Consumer;

public class PrintNumber implements Consumer<Integer> {


    @Override
    public void accept(Integer integer) {
        System.out.println(integer);
    }
}
