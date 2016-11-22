/// <reference path="./drawingPlane.ts"/>

class LineEditor{
    private simpleMovableGraph: SimpleMovablePlane;
    private simplePath: SimplePathPlane;
    private name: string;
    private scene: BABYLON.Scene;

private finishedEditingMovable: boolean;
private finishedEditingPath: boolean;
    constructor(name:string, scene: BABYLON.Scene){
        this.scene = scene;
        this.name = name;
        this.simplePath = new SimplePathPlane("plane", 0, 0, scene);
        this.simpleMovableGraph = new SimpleMovablePlane("plane", 500, 0, scene);
    }
    public finishEditingMovable():void
    {
        this.finishedEditingMovable = true;
        this.simpleMovableGraph.finishDrawing();
        this.tryStartMoving();
    }
    public finishEditingPath():void
    {
        this.finishedEditingPath = true;
        this.simplePath.finishDrawing();
        this.tryStartMoving();
    }
    protected tryStartMoving():void{
        if (this.finishedEditingMovable && this.finishedEditingPath){
            let points = this.simpleMovableGraph.graph.getVertices();
            let points2D: BABYLON.Vector2[] = [];
            for (var point of points)
            {
                points2D.push(new BABYLON.Vector2(point.x, point.y));
            }
            console.log("before" + points2D);
            let movable = new LinAlgMovable("movable222",points2D, this.scene);
            console.log("after");
            console.log(movable);
            this.simplePath.startMoving(movable);
            
        }
    }
    public onPointerEvent(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void{
        this.simpleMovableGraph.onPointerDown(evt, pickingInfo);
        this.simplePath.onPointerDown(evt, pickingInfo);
    }
    public Tick(deltaTime: number){
        this.simplePath.update(deltaTime);
    }
}

class CurveEditor{
    protected curvePlane: LongSimpleCurvePlane;
    private name: string;
    private scene: BABYLON.Scene;
    constructor(name:string, scene: BABYLON.Scene){
        this.scene = scene;
        this.name = name;
        this.curvePlane = new LongSimpleCurvePlane("plane", 0, 0, scene);
    }
    public onPointerDown(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void{
        this.curvePlane.onPointerDown(evt, pickingInfo);
    }
    public onPointerUp(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void{
        this.curvePlane.onPointerUp(evt, pickingInfo);
    }
    public onPointerMove(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void{
        this.curvePlane.onPointerMove(evt, pickingInfo);
    }

    public saveJsonData(): string{
        return this.curvePlane.saveJsonData();
    }

    public loadJsonData(json: string): void{
        this.curvePlane.loadJsonData(json);
    }

    public loadVectorData(vectorData: Vector[]): void{
        this.curvePlane.loadVectorData(vectorData);
    }
}