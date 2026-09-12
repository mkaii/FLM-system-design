package reentrantlock;

public class OuterRunnable implements Runnable {

    private final Resource resource;

    public OuterRunnable(Resource resource) {
        this.resource = resource;
    }

    @Override
    public void run() {
        try {
            resource.outer();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
