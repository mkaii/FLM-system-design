package payment;

import payment.exception.InvalidPaymentException;

public class UPIPayment implements IPaymentStrategy{

    private static final double PROCESSING_FEE = 0.10;

    @Override
    public double process(double amountTendered) {
        if (amountTendered <= PROCESSING_FEE) {
            throw new InvalidPaymentException("amount too small to cover the UPI processing fee");
        }
        return amountTendered - PROCESSING_FEE;
    }

    @Override
    public boolean doesAffectChangeReserve() {
        return true;
    }
}
