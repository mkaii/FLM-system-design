import java.util.concurrent.Callable;

public class MyCalculation implements Callable<Integer> {



    @Override
    public Integer call() throws Exception {
        System.out.println(Thread.currentThread().getName());

        Thread.sleep(5000);
        return 10 + 20;
    }
}
