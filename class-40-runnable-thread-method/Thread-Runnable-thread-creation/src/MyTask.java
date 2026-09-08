public class MyTask  implements Runnable {
    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + " Task running");
        for(int i=0; i< 5; i++){
            System.out.println(Thread.currentThread().getName() + " " + i);
        }

        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        System.out.println(Thread.currentThread().getName() + " Task finished");
    }
}
