package com.solovyev.games.life.domain;

public class InitParams
{
    private final Integer boardHeight;
    private final Integer boardWidth;
    private final Integer timerTick;

    public InitParams(Integer boardWidth, Integer boardHeight, Integer timerTick)
    {
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        this.timerTick = timerTick;
    }

    private InitParams()
    {
        this(null, null, null);
    }

    public Integer getBoardHeight()
    {
        return boardHeight;
    }

    public Integer getBoardWidth()
    {
        return boardWidth;
    }

    public Integer getTimerTick()
    {
        return timerTick;
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        InitParams that = (InitParams) o;

        if (boardHeight != null ? !boardHeight.equals(that.boardHeight) : that.boardHeight != null) return false;
        if (boardWidth != null ? !boardWidth.equals(that.boardWidth) : that.boardWidth != null) return false;
        return timerTick != null ? timerTick.equals(that.timerTick) : that.timerTick == null;

    }

    @Override
    public int hashCode()
    {
        int result = boardHeight != null ? boardHeight.hashCode() : 0;
        result = 31 * result + (boardWidth != null ? boardWidth.hashCode() : 0);
        result = 31 * result + (timerTick != null ? timerTick.hashCode() : 0);
        return result;
    }

    @Override
    public String toString()
    {
        return "InitParams{" +
                "boardHeight=" + boardHeight +
                ", boardWidth=" + boardWidth +
                ", timerTick=" + timerTick +
                '}';
    }
}
