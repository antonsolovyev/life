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

        insert(new Pattern(null, "Glider (default)", new HashSet<Pattern.Location>()
        {{
            add(new Pattern.Location(0, 2));
            add(new Pattern.Location(1, 2));
            add(new Pattern.Location(2, 2));
            add(new Pattern.Location(1, 0));
            add(new Pattern.Location(2, 1));
        }}));
        insert(new Pattern(null, "Flip-flop", new HashSet<Pattern.Location>()
        {{
            add(new Pattern.Location(1, 1));
            add(new Pattern.Location(1, 2));
            add(new Pattern.Location(1, 3));
        }}));
    }

    private Long insert(Pattern pattern)
    {
        patterns.put(nextId, new Pattern(nextId, pattern.getName(), pattern.getLocations()));
        Long res = nextId;
        nextId++;
        return res;
    }

    public Pattern readPattern(Long id)
    {
        return patterns.get(id);
    }

    public List<Pattern> readPatterns()
    {
        return new ArrayList<Pattern>(patterns.values());
    }

    public Long createPattern(Pattern pattern)
    {
        return insert(pattern);
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
