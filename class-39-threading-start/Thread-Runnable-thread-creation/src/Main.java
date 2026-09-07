//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
void main() {

    System.out.println(Thread.currentThread().getName() + " start");
    MyThread t1 = new MyThread();
    MyThread t2 = new MyThread();

    System.out.println(Thread.currentThread().getName() + " 2 threads created before calling the start method");
    t1.start();
    //t1.start(); not allowed

    t2.start();

    System.out.println(Thread.currentThread().getName() + " after calling the start method on both of them");
    System.out.println("Mainak Ghosh");

}
