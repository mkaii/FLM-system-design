public class MyTask implements Runnable {

    private int taskNumber;

    public MyTask(int taskNumber) {
        this.taskNumber = taskNumber;
    }

    @Override
    public void run() {
        System.out.println(taskNumber + " is running with " + Thread.currentThread().getName());
    }
}
