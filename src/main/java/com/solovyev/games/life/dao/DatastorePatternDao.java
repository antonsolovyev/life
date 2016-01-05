package com.solovyev.games.life.dao;

import com.google.appengine.api.datastore.*;
import com.solovyev.games.life.domain.Pattern;
import org.apache.log4j.Logger;

import java.util.*;

public class DatastorePatternDao implements PatternDao
{
    private static final Logger LOGGER = Logger.getLogger(DatastorePatternDao.class.getName());

    private static final String PATTERN_ENTITY_KIND = "Pattern";
    private static final String PATTERN_LIST_ENTITY_KIND = "PatternList";
    private static final String PATTERN_LIST_ENTITY_KEY_NAME = "PatternListKey";
    public static final String NAME_PROPERTY = "name";
    public static final String CREATION_DATE_PROPERTY = "creationDate";
    public static final String LOCATIONS_X_PROPERTY = "locationsX";
    public static final String LOCATIONS_Y_PROPERTY = "locationsY";

    private final DatastoreService datastoreService;
    private Key patternListKey;

    public DatastorePatternDao()
    {
        datastoreService = DatastoreServiceFactory.getDatastoreService();

        initPatternListEntity();
    }

    private void initPatternListEntity()
    {
        Transaction transaction = datastoreService.beginTransaction();
        try
        {
            patternListKey = datastoreService.get(KeyFactory.createKey(PATTERN_LIST_ENTITY_KIND,
                    PATTERN_LIST_ENTITY_KEY_NAME)).getKey();

            transaction.commit();
        }
        catch (EntityNotFoundException e)
        {
            patternListKey = datastoreService.put(new Entity(PATTERN_LIST_ENTITY_KIND, PATTERN_LIST_ENTITY_KEY_NAME));

            transaction.commit();
        }
        finally
        {
            if (transaction.isActive())
            {
                transaction.rollback();
            }
        }
        LOGGER.debug("patternListKey:" + patternListKey);
    }

    private Entity patternToEntity(Pattern pattern)
    {
        Entity res = new Entity(PATTERN_ENTITY_KIND, patternListKey);

        res.setProperty(NAME_PROPERTY, pattern.getName());
        res.setProperty(CREATION_DATE_PROPERTY, pattern.getCreationDate());

        List<Integer> locationsX = new ArrayList<Integer>();
        List<Integer> locationsY = new ArrayList<Integer>();
        for(Pattern.Location l : pattern.getLocations())
        {
            locationsX.add(l.getX());
            locationsY.add(l.getY());
        }
        res.setProperty(LOCATIONS_X_PROPERTY, locationsX);
        res.setProperty(LOCATIONS_Y_PROPERTY, locationsY);

        return res;
    }

    private Pattern entityToPattern(Entity entity)
    {
        String name = (String) entity.getProperty(NAME_PROPERTY);
        Date creationDate = (Date) entity.getProperty(CREATION_DATE_PROPERTY);

        List<Long> locationsX = (List<Long>) entity.getProperty(LOCATIONS_X_PROPERTY);
        List<Long> locationsY = (List<Long>) entity.getProperty(LOCATIONS_Y_PROPERTY);
        Set<Pattern.Location> locations = new HashSet<Pattern.Location>();
        for(int i = 0; i < locationsX.size(); i++)
        {
            locations.add(new Pattern.Location(locationsX.get(i).intValue(), locationsY.get(i).intValue()));
        }

        return new Pattern(entity.getKey().getId(), name, creationDate, locations);
    }

    public Pattern readPattern(Long id)
    {
        try
        {
            return entityToPattern(datastoreService.get(KeyFactory.createKey(patternListKey,
                    PATTERN_ENTITY_KIND, id)));
        }
        catch(EntityNotFoundException e)
        {
            throw new RuntimeException("non-existent id", e);
        }
    }

    public List<Pattern> readPatterns()
    {
        List<Entity> entities = datastoreService.prepare(new Query(PATTERN_ENTITY_KIND).addSort("creationDate",
                Query.SortDirection.DESCENDING).setAncestor(
                patternListKey)).asList(FetchOptions.Builder.withDefaults());

        List<Pattern> res = new ArrayList<Pattern>();
        for(Entity e : entities)
        {
            res.add(entityToPattern(e));
        }

        return res;
    }

    public Long createPattern(Pattern pattern)
    {
        return datastoreService.put(patternToEntity(pattern)).getId();
    }

    public void updatePattern(Long id, Pattern pattern)
    {
        Transaction transaction = datastoreService.beginTransaction();
        try
        {
            Entity entity = datastoreService.get(KeyFactory.createKey(patternListKey,
                    PATTERN_ENTITY_KIND, id));

            entity.setPropertiesFrom(patternToEntity(pattern));

            datastoreService.put(entity);

            transaction.commit();
        }
        catch (EntityNotFoundException e)
        {
            throw new RuntimeException("non-existent id", e);
        }
        finally
        {
            if (transaction.isActive())
            {
                transaction.rollback();
            }
        }
    }

    public void deletePattern(Long id)
    {
        Transaction transaction = datastoreService.beginTransaction();
        try
        {
            datastoreService.get(KeyFactory.createKey(patternListKey,
                    PATTERN_ENTITY_KIND, id));

            datastoreService.delete(KeyFactory.createKey(patternListKey,
                    PATTERN_ENTITY_KIND, id));

            transaction.commit();
        }
        catch (EntityNotFoundException e)
        {
            throw new RuntimeException("non-existent id", e);
        }
        finally
        {
            if (transaction.isActive())
            {
                transaction.rollback();
            }
        }
    }
}
