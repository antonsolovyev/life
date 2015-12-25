package com.solovyev.games.life.rest;

import com.solovyev.games.life.domain.ConfigBean;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Component
@Path("/")
public class LifeResource
{
    private static final Logger LOGGER = Logger.getLogger(LifeResource.class.getName());

    public LifeResource()
    {
        LOGGER.info("created LifeResource: " + this);
    }

    @GET
    @Path("/init")
    @Produces({ MediaType.APPLICATION_JSON })
    public ConfigBean getConfigBean()
    {
        return new ConfigBean(100, 100);
    }
}
