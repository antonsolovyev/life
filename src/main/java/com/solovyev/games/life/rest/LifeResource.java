package com.solovyev.games.life.rest;

import com.solovyev.games.life.dao.PatternDao;
import com.solovyev.games.life.domain.InitParams;
import com.solovyev.games.life.domain.Pattern;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.*;
import java.util.*;
import java.util.concurrent.Callable;

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
        return wrapExceptions(new Callable<InitParams>()
        {
            public InitParams call() throws Exception
            {
                return new InitParams(boardWidth, boardHeight, timerTick);
            }
        });
    }

    @GET
    @Path("/patterns")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Pattern> readPatterns()
    {
        return wrapExceptions(new Callable<List<Pattern>>()
        {
            public List<Pattern> call() throws Exception
            {
                return patternDao.readPatterns();
            }
        });
    }

    @GET
    @Path("/patterns/{id}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Pattern readPattern(@PathParam("id") final Long id)
    {
        return wrapExceptions(new Callable<Pattern>()
        {
            public Pattern call() throws Exception
            {
                return patternDao.readPattern(id);
            }
        });
    }

    @POST
    @Path("/patterns")
    @Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public Long createPattern(final Pattern pattern)
    {
        return wrapExceptions(new Callable<Long>()
        {
            public Long call() throws Exception
            {
                return patternDao.createPattern(new Pattern(null, pattern.getName(), new Date(), pattern.getLocations()));
            }
        });
    }

    @PUT
    @Path("/patterns/{id}")
    @Consumes({ MediaType.APPLICATION_JSON })
    public void updatePattern(@PathParam("id") final Long id, final Pattern pattern)
    {
        wrapExceptions(new Callable<Void>()
        {
            public Void call() throws Exception
            {
                patternDao.updatePattern(id, new Pattern(null, pattern.getName(), new Date(), pattern.getLocations()));

                return null;
            }
        });
    }

    @DELETE
    @Path("/patterns/{id}")
    @Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public void deletePattern(@PathParam("id") final Long id)
    {
        wrapExceptions(new Callable<Void>()
        {
            public Void call() throws Exception
            {
                patternDao.deletePattern(id);

                return null;
            }
        });
    }

    @POST
    @Path("/upload")
    @Consumes({ MediaType.MULTIPART_FORM_DATA })
    @Produces({ MediaType.APPLICATION_JSON })
    public Long upload(@FormDataParam("name") final String name, @FormDataParam("file") final InputStream inputStream,
                       @FormDataParam("file") final FormDataContentDisposition fileDisposition)
    {
        return  wrapExceptions(new Callable<Long>()
        {
            public Long call() throws Exception
            {
                LOGGER.info("File upload, pattern name: " + name + ", file name: " + fileDisposition.getFileName() +
                        ", stream: " + inputStream);

                String name2 = name.trim();
                if(StringUtils.isBlank(name2))
                {
                    name2 = FilenameUtils.getBaseName(fileDisposition.getFileName());
                }

                List<String> strings = IOUtils.readLines(inputStream);

                Pattern pattern = parsePattern(name2, strings);

                LOGGER.info("Uploaded pattern: " + pattern);

                return patternDao.createPattern(pattern);
            }
        });
    }

    private Pattern parsePattern(String name, List<String> lines)
    {
        if (lines.get(0).contains("Life 1.06"))
        {
            return parsePatternLife106(name, lines);
        }
        else
        {
            throw new IllegalArgumentException("Unknown file format");
        }
    }

    private Pattern parsePatternLife106(String name, List<String> lines)
    {
        try
        {
            List<Pattern.Location> locations = new ArrayList<Pattern.Location>();
            for (String s : lines)
            {
                s = s.replaceFirst("#.*", "").trim();
                if (StringUtils.isBlank(s))
                {
                    continue;
                }

                String[] coordinates = s.split("\\s+");
                if (coordinates.length != 2)
                {
                    throw new IllegalArgumentException("Invalid coordinate string: " + s);
                }

                locations.add(new Pattern.Location(Integer.parseInt(coordinates[0]), Integer.parseInt(coordinates[1])));
            }
            return new Pattern(null, name, new Date(), locations);
        }
        catch(NumberFormatException e)
        {
            throw new IllegalArgumentException("Error parsing cell location: " + e.getMessage(), e);
        }
    }
    
    private <V> V wrapExceptions(Callable<V> callable)
    {
        try
        {
            return callable.call();
        }
        catch(IllegalArgumentException iae)
        {
            throw new WebApplicationException(iae,
                    Response.status(
                            Response.Status.BAD_REQUEST).entity(iae.getMessage()).type(MediaType.TEXT_PLAIN).build());
        }
        catch(Exception e)
        {
            LOGGER.warn("Error processing file upload", e);

            throw new RuntimeException(e);
        }
    }
}
