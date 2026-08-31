package payment;

public interface IPaymentStrategy {

    double process(double amount);

     default boolean doesAffectChangeReserve(){
        return false;
    }
}
