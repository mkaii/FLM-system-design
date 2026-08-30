package payment;

import payment.exception.InvalidPaymentException;

public class CashPayment implements IPaymentStrategy{

    @Override
    public double process(double amountTendered) {
        if (amountTendered <= 0) {
            throw new InvalidPaymentException("cash amount must be positive");
        }
        return amountTendered;
    }
}
