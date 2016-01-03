package com.solovyev.games.life.dao;

import com.solovyev.games.life.domain.Pattern;

import java.util.List;

public interface PatternDao
{
    Pattern readPattern(Long id);
    List<Pattern> readPatterns();
    Long createPattern(Pattern pattern);
    void updatePattern(Long id, Pattern pattern);
    void deletePattern(Long id);
}
