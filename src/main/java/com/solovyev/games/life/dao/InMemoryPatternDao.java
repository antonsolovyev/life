package com.solovyev.games.life.dao;

import com.solovyev.games.life.domain.Pattern;

import java.util.*;

public class InMemoryPatternDao implements PatternDao
{
    private Map<Long, Pattern> patterns;
    private Long nextId = 0L;

    public InMemoryPatternDao()
    {
        patterns = new HashMap<Long, Pattern>();

        add(new Pattern(null, "Glider", new HashSet<Pattern.Location>()
        {{
            add(new Pattern.Location(0, 2));
            add(new Pattern.Location(1, 2));
            add(new Pattern.Location(2, 2));
            add(new Pattern.Location(1, 0));
            add(new Pattern.Location(2, 1));
        }}));
        add(new Pattern(null, "Blinker", new HashSet<Pattern.Location>()
        {{
            add(new Pattern.Location(1, 1));
            add(new Pattern.Location(1, 2));
            add(new Pattern.Location(1, 3));
        }}));
    }

    private Long add(Pattern pattern)
    {
        patterns.put(nextId, new Pattern(nextId, pattern.getName(), pattern.getLocations()));
        Long res = nextId;
        nextId++;
        return res;
    }

    public InMemoryPatternDao(List<Pattern> patterns)
    {
        this.patterns = new HashMap<Long, Pattern>();

        for(Pattern p : patterns)
        {
            add(p);
        }
    }

    public Pattern readPattern(Long id)
    {
        if(!patterns.containsKey(id))
        {
            throw new RuntimeException("non-existent id");
        }

        return patterns.get(id);
    }

    public List<Pattern> readPatterns()
    {
        return new ArrayList<Pattern>(patterns.values());
    }

    public Long createPattern(Pattern pattern)
    {
        return add(pattern);
    }

    public void updatePattern(Long id, Pattern pattern)
    {
        if(!patterns.containsKey(id))
        {
            throw new RuntimeException("non-existent id");
        }

        patterns.put(id, pattern);
    }

    public void deletePattern(Long id)
    {
        if(!patterns.containsKey(id))
        {
            throw new RuntimeException("non-existent id");
        }

        patterns.remove(id);
    }
}
