public class Fibonacci implements Runnable{

    private int n;

    public Fibonacci(int n) {
        this.n = n;
    }

    private int getNthfib(int n){

        if(n==1 || n==2){
            return 1;
        }

        return getNthfib(n-1)+getNthfib(n-2);
    }

    @Override
    public void run() {
        System.out.println(getNthfib(n));
    }
}
