public class SingletonTask implements Runnable {
    @Override
    public void run() {

        Singleton instance = Singleton.getInstance();
        System.out.println(instance);
    }
}
