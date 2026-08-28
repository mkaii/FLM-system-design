package service;

public class ChangeService {

    private double changeReserve;

    public ChangeService(double changeReserve) {
        this.changeReserve = changeReserve;
    }

    public boolean canMakeChange(double amount) {
        return changeReserve >= amount;
    }

    public void releaseChange(double amount) {
        if (amount > changeReserve) {
            throw new IllegalStateException("not enough change reserve to release " + amount);
        }
        changeReserve -= amount;
    }

    public void receiveCash(double amount) {
        changeReserve += amount;
    }

    public double getChangeReserve() {
        return changeReserve;
    }
}
