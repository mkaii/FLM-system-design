public class Counter {

    private int count = 0;

    // critical section
    public synchronized void increment()  {
        count++;

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            System.out.println("Interrupted");
        }
    }
    public int getCount() {
        return count;
    }
}
