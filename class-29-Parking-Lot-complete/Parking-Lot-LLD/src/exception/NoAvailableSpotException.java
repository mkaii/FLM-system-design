package exception;

public class NoAvailableSpotException extends RuntimeException{

    public NoAvailableSpotException(String message){
        super(message);
    }
}
