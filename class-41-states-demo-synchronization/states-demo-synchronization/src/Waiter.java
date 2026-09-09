public class Waiter implements Runnable {

    private Thread threadToWaitFor;

    public Waiter(Thread threadToWaitFor) {
        this.threadToWaitFor = threadToWaitFor;
    }

    @Override
    public void run() {
        try {

            System.out.println("start waiting ");
            threadToWaitFor.join();
            System.out.println("enough waiting");
        } catch (InterruptedException e) {
            System.out.println("error...");
        }
    }
}
