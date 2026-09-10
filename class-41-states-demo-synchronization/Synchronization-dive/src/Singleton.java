class Singleton {

    private static Singleton instance;

    private Singleton() {
    }

    public static Singleton getInstance() {

        synchronized(Singleton.class) {
            if (instance == null) {

                // Only to make the race condition easy to reproduce
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                instance = new Singleton();
            }

            return instance;
        }
    }
}