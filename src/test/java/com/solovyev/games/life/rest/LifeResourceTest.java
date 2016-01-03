package com.solovyev.games.life.rest;

import com.solovyev.games.life.dao.PatternDao;
import com.solovyev.games.life.domain.ConfigBean;
import com.solovyev.games.life.domain.Pattern;
import org.apache.log4j.Logger;
import org.glassfish.jersey.servlet.ServletContainer;
import org.glassfish.jersey.test.DeploymentContext;
import org.glassfish.jersey.test.JerseyTest;
import org.glassfish.jersey.test.ServletDeploymentContext;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.glassfish.jersey.test.spi.TestContainerFactory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.aop.framework.ProxyFactoryBean;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextListener;

import javax.servlet.ServletContextEvent;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.*;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Mockito.*;

public class LifeResourceTest extends JerseyTest
{
    private static final Logger LOGGER = Logger.getLogger(LifeResourceTest.class.getName());

    private static ThreadLocal<WebApplicationContext> webApplicationContextThreadLocal =
        new ThreadLocal<WebApplicationContext>();

    PatternDao patternDao;

    @Override
    protected TestContainerFactory getTestContainerFactory()
    {
        return new GrizzlyWebTestContainerFactory();
    }

    public static class ContextSavingContextLoaderListener extends ContextLoaderListener
    {
        @Override
        public void contextInitialized(ServletContextEvent event)
        {
            super.contextInitialized(event);
            webApplicationContextThreadLocal.set(ContextLoaderListener.getCurrentWebApplicationContext());
        }
    }

    @Before
    public void setUp() throws Exception
    {
        super.setUp();

        patternDao = mock(PatternDao.class);
        ProxyFactoryBean proxyFactoryBean = (ProxyFactoryBean) webApplicationContextThreadLocal.get().getBean("&patternDao");
        proxyFactoryBean.setTarget(patternDao);
    }

    @After
    public void tearDown() throws Exception
    {
        super.tearDown();
        reset(patternDao);
    }

    @Override
    protected DeploymentContext configureDeployment()
    {
        ServletDeploymentContext.Builder builder = ServletDeploymentContext.forServlet(ServletContainer.class);

        builder.initParam("jersey.config.server.provider.packages", "com.solovyev.games.life");
        builder.contextParam("contextConfigLocation", "classpath:applicationContext-lifeResource-test.xml");
        builder.addListener(ContextSavingContextLoaderListener.class);
        builder.addListener(RequestContextListener.class);

        return builder.build();
    }

    @Test
    public void testGetInitBlock() throws Exception
    {
        ConfigBean initBlock = target("/init").request().get(ConfigBean.class);
        assertEquals(new ConfigBean(100, 100), initBlock);
    }

    @Test
    public void testReadPatterns() throws Exception
    {
        List<Pattern> patterns = makePatternList();
        when(patternDao.readPatterns()).thenReturn(patterns);
        List<Pattern> res = target("/patterns").request().get(new GenericType<List<Pattern>>(){});
        assertEquals(patterns, res);
    }

    private List<Pattern> makePatternList()
    {
        final Set<Pattern.Location> locations = new HashSet<Pattern.Location>()
        {{
            add(new Pattern.Location(0, 2));
            add(new Pattern.Location(1, 2));
            add(new Pattern.Location(2, 2));
            add(new Pattern.Location(1, 0));
            add(new Pattern.Location(2, 1));
        }};
        final Set<Pattern.Location> locations2 = new HashSet<Pattern.Location>()
        {{
            add(new Pattern.Location(1, 1));
            add(new Pattern.Location(1, 2));
            add(new Pattern.Location(1, 3));
        }};

        List<Pattern> res = new ArrayList<Pattern>()
        {{
            add(new Pattern(null, "Default pattern", locations));
            add(new Pattern(null, "Flip", locations2));
        }};

        return res;
    }

    @Test
    public void testReadPattern() throws Exception
    {
        List<Pattern> patterns = makePatternList();
        when(patternDao.readPattern(anyLong())).thenReturn(patterns.get(0));
        Pattern pattern = target("/patterns/1").request().get().readEntity(Pattern.class);
        assertEquals(patterns.get(0), pattern);
    }

    @Test
    public void testDeletePattern() throws Exception
    {
        target("/patterns/1").request().delete();

        verify(patternDao, times(1)).deletePattern(1L);
    }

    @Test
    public void testCreatePattern() throws Exception
    {
        List<Pattern> patterns = makePatternList();

        final Set<Pattern.Location> locations = new HashSet<Pattern.Location>()
        {{
            add(new Pattern.Location(1, 1));
            add(new Pattern.Location(1, 2));
        }};

        Pattern pattern = new Pattern(null, "Updated flip", locations);

        target("/patterns").request().post(Entity.entity(pattern, MediaType.APPLICATION_JSON_TYPE));

        verify(patternDao, times(1)).createPattern(pattern);
    }

    @Test
    public void testUpdatePattern() throws Exception
    {
        final Set<Pattern.Location> locations = new HashSet<Pattern.Location>()
        {{
            add(new Pattern.Location(1, 1));
            add(new Pattern.Location(1, 2));
        }};

        Pattern pattern = new Pattern(null, "Updated flip", locations);

        target("/patterns/1").request().put(Entity.entity(pattern, MediaType.APPLICATION_JSON_TYPE));

        verify(patternDao, times(1)).updatePattern(1L, pattern);
    }
}