package com.solovyev.games.life.dao;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.solovyev.games.life.domain.Pattern;

import java.io.IOException;
import java.util.*;

public class InMemoryPatternDao implements PatternDao
{
    private Map<Long, Pattern> patterns = new HashMap<Long, Pattern>();
    private Long nextId = 0L;

    public InMemoryPatternDao()
    {
    }

    public InMemoryPatternDao(String serializedPatternsList) throws IOException
    {
        this(new ObjectMapper().<List<Pattern>>readValue(serializedPatternsList,
                new TypeReference<List<Pattern>>(){}));
    }

    public InMemoryPatternDao(List<Pattern> patterns)
    {
        for(Pattern p : patterns)
        {
            add(p);
        }
    }

    private Long add(Pattern pattern)
    {
        patterns.put(nextId, new Pattern(nextId, pattern.getName(), new Date(), pattern.getLocations()));
        Long res = nextId;
        nextId++;
        return res;
    }

    public Pattern readPattern(Long id)
    {
        if(!patterns.containsKey(id))
        {
            throw new IllegalArgumentException("Non-existent id");
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
            throw new IllegalArgumentException("Non-existent id");
        }

        patterns.put(id, pattern);
    }

    public void deletePattern(Long id)
    {
        if(!patterns.containsKey(id))
        {
            throw new IllegalArgumentException("Non-existent id");
        }

        patterns.remove(id);
    }
}
