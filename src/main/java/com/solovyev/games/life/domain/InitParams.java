package com.solovyev.games.life.domain;

public class InitParams
{
    private final Integer boardSizeLog2;
    private final Integer timerTick;

    public InitParams(Integer boardWidthLog2, Integer timerTick)
    {
        this.boardSizeLog2 = boardWidthLog2;
        this.timerTick = timerTick;
    }

    private InitParams()
    {
        this(null, null);
    }

    public Integer getTimerTick()
    {
        return timerTick;
    }

    @Override
    public String toString()
    {
        return "InitParams{" +
            "boardSizeLog2=" + boardSizeLog2 +
            ", timerTick=" + timerTick +
            '}';
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o)
        {
            return true;
        }
        if ((o == null) || (getClass() != o.getClass()))
        {
            return false;
        }

        InitParams that = (InitParams) o;

        if ((boardSizeLog2 != null) ? (!boardSizeLog2.equals(that.boardSizeLog2)) : (that.boardSizeLog2 != null))
        {
            return false;
        }

        return (timerTick != null) ? timerTick.equals(that.timerTick) : (that.timerTick == null);

    }

    @Override
    public int hashCode()
    {
        int result = (boardSizeLog2 != null) ? boardSizeLog2.hashCode() : 0;
        result = (31 * result) + ((timerTick != null) ? timerTick.hashCode() : 0);

        return result;
    }

    public Integer getBoardSizeLog2()
    {
        return boardSizeLog2;
    }
}
