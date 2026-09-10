public class BankAccount {
    private int balance;

    public BankAccount(int balance) {
        this.balance = balance;
    }

    public  void withdraw(int amount) {
        if (amount <= 0) {
            return;
        }

        synchronized (this) {
            if (amount > balance) {
                return;
            }

            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }

            balance = balance - amount;
        }
    }

    public int getBalance() {
        return balance;
    }
}
