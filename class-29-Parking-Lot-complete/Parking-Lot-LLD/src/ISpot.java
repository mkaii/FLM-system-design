public interface ISpot {

    SpotSize getSize();

    void setState(IState state);

    boolean isAvailable();

    void release();

    void assign();


}
