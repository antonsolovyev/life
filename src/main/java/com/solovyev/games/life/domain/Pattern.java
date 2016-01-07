package com.solovyev.games.life.domain;


import java.util.Date;
import java.util.List;
import java.util.Set;

public class Pattern
{
    private final Long id;
    private final String name;
    private Date creationDate;
    private final List<Location> locations;

    public Pattern(Long id, String name, Date creationDate, List<Location> locations)
    {
        this.id = id;
        this.name = name;
        this.creationDate = creationDate;
        this.locations = locations;
    }

    private Pattern()
    {
        this(null, null, null, null);
    }

    public Long getId()
    {
        return id;
    }

    public String getName()
    {
        return name;
    }

    public Date getCreationDate()
    {
        return creationDate;
    }

    public List<Location> getLocations()
    {
        return locations;
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Pattern pattern = (Pattern) o;

        if (id != null ? !id.equals(pattern.id) : pattern.id != null) return false;
        if (name != null ? !name.equals(pattern.name) : pattern.name != null) return false;
        if (creationDate != null ? !creationDate.equals(pattern.creationDate) : pattern.creationDate != null)
            return false;
        return locations != null ? locations.equals(pattern.locations) : pattern.locations == null;

    }

    @Override
    public int hashCode()
    {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (creationDate != null ? creationDate.hashCode() : 0);
        result = 31 * result + (locations != null ? locations.hashCode() : 0);
        return result;
    }

    @Override
    public String toString()
    {
        return "Pattern{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", creationDate=" + creationDate +
                ", locations=" + locations +
                '}';
    }

    public static class Location
    {
        private final Integer x;
        private final Integer y;

        public Location(Integer x, Integer y)
        {
            this.x = x;
            this.y = y;
        }

        private Location()
        {
            this(null, null);
        }

        public Integer getX()
        {
            return x;
        }

        public Integer getY()
        {
            return y;
        }

        @Override
        public String toString()
        {
            return "Location{" +
                    "x=" + x +
                    ", y=" + y +
                    '}';
        }

        @Override
        public boolean equals(Object o)
        {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            Location location = (Location) o;

            if (x != null ? !x.equals(location.x) : location.x != null) return false;
            return y != null ? y.equals(location.y) : location.y == null;

        }

        @Override
        public int hashCode()
        {
            int result = x != null ? x.hashCode() : 0;
            result = 31 * result + (y != null ? y.hashCode() : 0);
            return result;
        }
    }
}
