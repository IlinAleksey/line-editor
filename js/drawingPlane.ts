/// <reference path="./graph.ts"/>
interface DrawingPlane{
    addPoint(point: BABYLON.Vector3) : void;
    onPointerEvent(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void;
    finishDrawing(): void; 
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
    abstract onPointerEvent(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void;
}

class SimpleInteractiveGraphPlane extends BaseInteractiveGraphPlane{
    protected plane: BABYLON.Mesh;
    protected graph: InteractiveGraph;
    constructor (name: string, width: number, height:number, scene: BABYLON.Scene, graph?: InteractiveGraph){
        super();
        this.plane =  BABYLON.Mesh.CreateGround(name, width, height, 2, scene);
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