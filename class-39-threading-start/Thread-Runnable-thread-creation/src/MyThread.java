public class MyThread extends Thread {

    void logic()
    {
        System.out.println(Thread.currentThread().getName());
        System.out.println("Task running");

    }

    @Override
    public void run(){
        logic();
    }
}
