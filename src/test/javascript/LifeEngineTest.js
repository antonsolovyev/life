describe('LifeEngine test', function()
{
    it('test glider pattern',function()
    {
        var generations = 10000;
        var lifeEngine = new Life.LifeEngine();

        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 0, y: 2, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 1, y: 2, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 2, y: 2, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 2, y: 1, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 1, y: 0, live: true}));

        var start = new Date().getTime();
        lifeEngine.iterate(generations);
        var end = new Date().getTime();

        // NB: replace with console.error to see output during command line run
        console.log("Iteration time: " + (end - start) + "ms");
        console.log("Generation: " + lifeEngine.generation);
        console.log("Live cells: " + lifeEngine.getLiveCells().length);

        expect(lifeEngine.generation).toBe(generations);
        expect(lifeEngine.getLiveCells().length).toBe(5);
    });

    it('test blinker pattern',function()
    {
        var generations = 10000;
        var lifeEngine = new Life.LifeEngine();

        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 1, y: 1, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 1, y: 2, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 1, y: 3, live: true}));

        var start = new Date().getTime();
        lifeEngine.iterate(generations);
        var end = new Date().getTime();

        console.log("Iteration time: " + (end - start) + "ms");
        console.log("Generation: " + lifeEngine.generation);
        console.log("Live cells: " + lifeEngine.getLiveCells().length);

        expect(lifeEngine.generation).toBe(generations);
        expect(lifeEngine.getLiveCells().length).toBe(3);
    });

    it('test bunnies pattern',function()
    {
        var generations = 1000;
        //var generations = 17332;
        var lifeEngine = new Life.LifeEngine();

        lifeEngine.setCell(new Life.LifeEngine.Cell({x: -4, y: -2, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 2, y: -2, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: -2, y: -1, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 2, y: -1, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: -2, y: 0, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 1, y: 0, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: 3, y: 0, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: -3, y: 1, live: true}));
        lifeEngine.setCell(new Life.LifeEngine.Cell({x: -1, y: 1, live: true}));

        var start = new Date().getTime();
        lifeEngine.iterate(generations);
        var end = new Date().getTime();

        console.log("Iteration time: " + (end - start) + "ms");
        console.log("Generation: " + lifeEngine.generation);
        console.log("Live cells: " + lifeEngine.getLiveCells().length);

        expect(lifeEngine.generation).toBe(generations);
        expect(lifeEngine.getLiveCells().length).toBe(383);
        //expect(lifeEngine.getLiveCells().length).toBe(1744);
    });
});