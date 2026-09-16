package common;

/*
 * Small printing helper shared by every experiment.
 * It only formats output - it does not change any ThreadPoolExecutor behaviour.
 */
public final class Log {

    private static final long START = System.currentTimeMillis();

    private Log() {
    }

    public static void line(String message) {
        long elapsed = System.currentTimeMillis() - START;
        System.out.println(String.format("[%6d ms] [%-14s] %s",
                elapsed, Thread.currentThread().getName(), message));
    }

    public static void banner(String title) {
        System.out.println();
        System.out.println("=========================================================");
        System.out.println("  " + title);
        System.out.println("=========================================================");
    }

    public static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
