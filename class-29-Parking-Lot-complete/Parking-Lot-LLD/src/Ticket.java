public class Ticket {

    private final IVehicle vehicle;
    private final ISpot spot;
    private final long entryTime;
    private long exitTime;

    public Ticket(IVehicle vehicle, ISpot spot, long entryTime) {
        this.vehicle = vehicle;
        this.spot = spot;
        this.entryTime = entryTime;
    }

    public IVehicle getVehicle() {
        return vehicle;
    }

    public ISpot getSpot() {
        return spot;
    }

    public long getEntryTime() {
        return entryTime;
    }

    public long getExitTime() {
        return exitTime;
    }

    public void setExitTime(long exitTime) {
        this.exitTime = exitTime;
    }

}
