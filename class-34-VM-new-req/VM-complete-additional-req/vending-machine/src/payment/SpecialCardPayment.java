package payment;

public class SpecialCardPayment extends CardPayment{

    private static final double SPECIAL_CARD_SURCHARGE = 0.25;

    @Override
    public double process(double amountTendered) {
        double credited = super.process(amountTendered);
        return credited - SPECIAL_CARD_SURCHARGE;
    }
}
