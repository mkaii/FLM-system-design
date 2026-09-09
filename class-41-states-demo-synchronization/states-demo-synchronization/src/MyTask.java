public class MyTask implements Runnable {

    @Override
    public void run() {
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            System.out.println("error...");
        }
    }
}
