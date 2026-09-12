package reentrantlock;

public class InnerRunnable implements Runnable {

    private final Resource resource;

    public InnerRunnable(Resource resource) {
        this.resource = resource;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + " trying to get lock in inner");
        resource.inner();
    }
}
