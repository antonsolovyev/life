package com.solovyev.games.life.rest;

import com.solovyev.games.life.dao.PatternDao;
import com.solovyev.games.life.domain.InitParams;
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
    private final Integer boardWidth;
    private final Integer boardHeight;
    private final Integer timerTick;

    public LifeResource(PatternDao patternDao, Integer boardWidth, Integer boardHeight, Integer timerTick)
    {
        this.patternDao = patternDao;
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        this.timerTick = timerTick;

        LOGGER.info("created LifeResource: " + this);
    }

    @GET
    @Path("/init")
    @Produces({ MediaType.APPLICATION_JSON })
    public InitParams getInitParams()
    {
        return new InitParams(boardWidth, boardHeight, timerTick);
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
        return patternDao.createPattern(new Pattern(null, pattern.getName(), new Date(), pattern.getLocations()));
    }

    @PUT
    @Path("/patterns/{id}")
    @Consumes({ MediaType.APPLICATION_JSON })
    public void updatePattern(@PathParam("id") Long id, Pattern pattern)
    {
        patternDao.updatePattern(id, new Pattern(null, pattern.getName(), new Date(), pattern.getLocations()));
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
