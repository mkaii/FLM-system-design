public class Main {

    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();

        Thread t1 = new Thread(new CounterRunnable(counter), "t1");
        Thread t2 = new Thread(new CounterRunnable(counter), "t2");

        t1.start();
        t2.start();

        t1.join();
        //t2.join();

        System.out.println("Final count: " + counter.getCount());
    }
}
