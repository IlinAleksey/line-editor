/// <reference path="./graph.ts"/>
interface DrawingPlane{
    addPoint(point: BABYLON.Vector3) : void;
    onPointerEvent(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void;
    finishDrawing(): void; 
    disableEditing(): void;
    enableEditing(): void;
}

interface MovableEditor{
    buildMovable(name: string, scene: BABYLON.Scene): Movable;
}

interface PathEditor{
    startMoving(movable: Movable): void;
    update(deltaTime: number): void;
}

abstract class BaseInteractiveGraphPlane implements DrawingPlane{
    protected isActive: boolean;
    protected graph: InteractiveGraph;
    constructor (){
        this.isActive = true;
    }
    addPoint(point: BABYLON.Vector3) : void{
        if (this.isActive){
            this.graph.addPoint(point);
        }
        
    }
    finishDrawing(): void{
        if (this.isActive){
            this.graph.closeGraph();
            this.isActive =false;
        }
    }
    disableEditing(): void{
        this.isActive = false;
    }
    enableEditing(): void{
        this.isActive = true;
    }
    abstract onPointerEvent(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void;
}

class SimpleInteractiveGraphPlane extends BaseInteractiveGraphPlane{
    protected plane: BABYLON.Mesh;
    public  graph: InteractiveGraph;
    constructor (name: string, width: number, height:number, scene: BABYLON.Scene, graph?: InteractiveGraph){
        super();
        this.plane =  BABYLON.Mesh.CreateGround(name, 400, 400, 2, scene);
        this.plane.translate(new BABYLON.Vector3(1,0,0), width);
        this.plane.rotate(new BABYLON.Vector3(1,0,0), -Math.PI / 2);
        if (graph){
            this.graph = graph;
        }
        
    }
    
    onPointerEvent(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void{
        
        if(pickingInfo.hit){
            if(pickingInfo.pickedMesh == this.plane)
            {
                this.addPoint(pickingInfo.pickedPoint);
            }
        }
    }
    
}

class SimplePathPlane extends SimpleInteractiveGraphPlane implements PathEditor{
    protected pathGraph:SimplePath;
    constructor(name: string, width: number, height:number, scene: BABYLON.Scene, graph?: InteractiveGraph){
        super(name, width, height, scene);
        this.pathGraph = new SimplePath("lines", [], scene);
        this.graph = this.pathGraph;
    }
    startMoving(movable: Movable): void{
        this.pathGraph.SetMovable(movable);
        this.pathGraph.StartMoving();
    }
    update(deltaTime: number): void{
        this.pathGraph.Tick(deltaTime);
    }
}

class SimpleMovablePlane extends SimpleInteractiveGraphPlane implements MovableEditor{
    constructor(name: string, width: number, height:number, scene: BABYLON.Scene, graph?: InteractiveGraph){
        super(name, width, height, scene);
        this.graph = new SimplePath("lines", [], scene);
    }
    public buildMovable(name: string, scene: BABYLON.Scene): Movable{
        let points = this.graph.getVertices();
        let points2D: BABYLON.Vector2[] = [];
        for (var point of points)
        {
            points2D.push(new BABYLON.Vector2(point.x, point.y));
        }
        console.log("before" + points2D);
        return new LinAlgMovable(name, points2D, scene);
    }
}