package com.solovyev.games.life.rest;

import com.solovyev.games.life.dao.PatternDao;
import com.solovyev.games.life.domain.ConfigBean;
import com.solovyev.games.life.domain.Pattern;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.*;

@Component
@Path("/")
public class LifeResource
{
    private static final Logger LOGGER = Logger.getLogger(LifeResource.class.getName());

    private final PatternDao patternDao;

    public LifeResource(PatternDao patternDao)
    {
        this.patternDao = patternDao;

        LOGGER.info("created LifeResource: " + this);
    }

    @GET
    @Path("/init")
    @Produces({ MediaType.APPLICATION_JSON })
    public ConfigBean getConfigBean()
    {
        return new ConfigBean(100, 100);
    }

    @GET
    @Path("/patterns")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Pattern> readPatterns()
    {
        return patternDao.readPatterns();
    }

    @GET
    @Path("/patterns/{id}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Pattern readPattern(@PathParam("id") Long id)
    {
        return patternDao.readPattern(id);
    }

    @POST
    @Path("/patterns")
    @Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public Long createPattern(Pattern pattern)
    {
        return patternDao.createPattern(pattern);
    }

    @PUT
    @Path("/patterns/{id}")
    @Consumes({ MediaType.APPLICATION_JSON })
    public void updatePattern(@PathParam("id") Long id, Pattern pattern)
    {
        patternDao.updatePattern(id, pattern);
    }

    @DELETE
    @Path("/patterns/{id}")
    @Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public void deletePattern(@PathParam("id") Long id)
    {
        patternDao.deletePattern(id);
    }
}
