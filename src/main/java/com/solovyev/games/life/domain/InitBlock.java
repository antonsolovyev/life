package com.solovyev.games.life.domain;

public class InitBlock
{
    private final Integer boardHeight;
    private final Integer boardWidth;

    public InitBlock(Integer boardWidth, Integer boardHeight)
    {
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
    }

    private InitBlock()
    {
        this(null, null);
    }

    public Integer getBoardHeight()
    {
        return boardHeight;
    }

    public Integer getBoardWidth()
    {
        return boardWidth;
    }

    @Override
    public String toString()
    {
        return "InitBlock{" +
                "boardHeight=" + boardHeight +
                ", boardWidth=" + boardWidth +
                '}';
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        InitBlock initBlock = (InitBlock) o;

        if (boardHeight != null ? !boardHeight.equals(initBlock.boardHeight) : initBlock.boardHeight != null)
            return false;
        return boardWidth != null ? boardWidth.equals(initBlock.boardWidth) : initBlock.boardWidth == null;

    }

    @Override
    public int hashCode()
    {
        int result = boardHeight != null ? boardHeight.hashCode() : 0;
        result = 31 * result + (boardWidth != null ? boardWidth.hashCode() : 0);
        return result;
    }
}
