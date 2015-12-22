package com.solovyev.games.life.rest;

import com.solovyev.games.life.domain.InitBlock;
import org.apache.commons.lang3.StringUtils;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.servlet.ServletContainer;
import org.glassfish.jersey.test.DeploymentContext;
import org.glassfish.jersey.test.JerseyTest;
import org.glassfish.jersey.test.ServletDeploymentContext;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.glassfish.jersey.test.spi.TestContainerFactory;
import org.junit.Test;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.request.RequestContextListener;

import javax.validation.OverridesAttribute;
import javax.ws.rs.core.Application;

import static org.junit.Assert.*;

public class LifeResourceTest extends JerseyTest
{
    @Override
    protected TestContainerFactory getTestContainerFactory()
    {
        return new GrizzlyWebTestContainerFactory();
    }

    @Override
    protected DeploymentContext configureDeployment()
    {
        ServletDeploymentContext.Builder builder = ServletDeploymentContext.forServlet(ServletContainer.class);

        builder.initParam("jersey.config.server.provider.packages", "com.solovyev.games.life");
        builder.contextParam("contextConfigLocation", "classpath:applicationContext-lifeResource-test.xml");
        builder.addListener(ContextLoaderListener.class);
        builder.addListener(RequestContextListener.class);

        return builder.build();
    }

    @Test
    public void testGetInitBlock() throws Exception
    {
        InitBlock initBlock = target("/init").request().get(InitBlock.class);
        assertEquals(new InitBlock(100, 100), initBlock);
    }
}