package com.solovyev.games.life.domain;

public class InitParams
{
    private final Integer cellSize;
    private final Integer timerTick;

    public InitParams(Integer cellSize, Integer timerTick)
    {
        this.cellSize = cellSize;
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

    public Integer getCellSize()
    {
        return cellSize;
    }

    @Override
    public String toString()
    {
        return "InitParams{" +
            "cellSize=" + cellSize +
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

        if ((cellSize != null) ? (!cellSize.equals(that.cellSize)) : (that.cellSize != null))
        {
            return false;
        }

        return (timerTick != null) ? timerTick.equals(that.timerTick) : (that.timerTick == null);

    }

    @Override
    public int hashCode()
    {
        int result = (cellSize != null) ? cellSize.hashCode() : 0;
        result = (31 * result) + ((timerTick != null) ? timerTick.hashCode() : 0);

        return result;
    }
}
