package machine.exception;

public class InvalidMachineStateException extends RuntimeException {

    public InvalidMachineStateException(String message) {
        super(message);
    }
}
