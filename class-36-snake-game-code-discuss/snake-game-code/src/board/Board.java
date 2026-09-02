package board;

public class Board {

    private final int width;
    private final int height;

    public Board(int width, int height) {
        this.width = width;
        this.height = height;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }


    // boundry condition
    public boolean isWithinBounds(int row, int col) {
        return row >= 0 && row < height && col >= 0 && col < width;
    }
}
