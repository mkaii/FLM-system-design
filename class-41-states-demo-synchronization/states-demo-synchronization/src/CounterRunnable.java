public class CounterRunnable implements Runnable {

    private final Counter counter;

    public CounterRunnable(Counter counter) {
        this.counter = counter;
    }


    // racing is happening
    public void doWork(){

        for(int i=1;i<=1000;i++){
            counter.increment();
        }
    }
    @Override
    public void run() {
        doWork();
    }
}
