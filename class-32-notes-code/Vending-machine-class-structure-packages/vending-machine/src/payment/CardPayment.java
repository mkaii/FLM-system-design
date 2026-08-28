package payment;

import payment.exception.InvalidPaymentException;

public class CardPayment implements IPaymentStrategy{

    private static final double MIN_CARD_AMOUNT = 5.0;

    @Override
    public double process(double amountTendered) {
        if (amountTendered < MIN_CARD_AMOUNT) {
            throw new InvalidPaymentException("card payments require a minimum of " + MIN_CARD_AMOUNT);
        }
        return amountTendered;
    }
}
