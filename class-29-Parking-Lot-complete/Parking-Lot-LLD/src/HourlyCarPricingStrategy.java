public class HourlyCarPricingStrategy implements IPricingStrategy {

    private static final double RATE_PER_HOUR = 40.0;

    @Override
    public double calculateFee(Ticket ticket) {
        long durationMillis = ticket.getExitTime() - ticket.getEntryTime();
        double hours = Math.max(1, Math.ceil(durationMillis / (1000.0 * 60 * 60)));
        return hours * RATE_PER_HOUR;
    }
}
