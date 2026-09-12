package reentrantlock;

public class Main {

    public static void main(String[] args) throws InterruptedException {
        Resource resource = new Resource();

        Thread t3 = new Thread(new OuterRunnable(resource), "t3");
        Thread t4 = new Thread(new InnerRunnable(resource), "t4");

        t3.start();
        Thread.sleep(200);
        t4.start();

        t3.join();
        t4.join();
    }
}
