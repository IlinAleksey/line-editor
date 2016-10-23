/// <reference path="./actor.ts"/>
interface InteractiveGraph{
    addPoint(point: BABYLON.Vector3) : void;
    closeGraph(): void;
    getVertices(): BABYLON.Vector3[];
    
}



abstract class BaseLineGraph implements InteractiveGraph{
    protected lineMesh: BABYLON.LinesMesh;
    protected name: string;
    protected points: BABYLON.Vector3[];
    protected scene: BABYLON.Scene;
    constructor(name:string, points: BABYLON.Vector2[], scene: BABYLON.Scene){
        this.scene = scene;
        this.points = [];
        for (var p of points){
            this.points.push(new BABYLON.Vector3(p.x, p.y, 0));
        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.points, scene, true);

    }
    public addPoint(point: BABYLON.Vector3) : void{

            this.points.push(point);
            this.lineMesh = BABYLON.Mesh.CreateLines(this.name, this.points, this.scene, true);

    }
    public closeGraph(): void{
        if (this.points.length >= 3){
            let point = this.points[0];
            this.points.push(point);
            this.lineMesh = BABYLON.Mesh.CreateLines(this.name, this.points, this.scene, true);
        }
    }
    public getVertices(): BABYLON.Vector3[]{
        return this.points;
    }
}


class SimplePath extends BaseLineGraph{
    private currentVertex: BABYLON.Vector3;
    private currentVertexIndex: number;
    private nextVertexIndex: number;
    private isActive: boolean;
    private closeEnough: number = 1;
    protected movable: Movable;

    protected switchVertexIndex(){
        let vertices: BABYLON.Vector3[] = this.getVertices();
        if (this.currentVertexIndex == vertices.length - 1)
        {
            this.currentVertexIndex = 0;
        }
        else{
            this.currentVertexIndex++;
        }
        if (this.nextVertexIndex == vertices.length - 1)
        {
            this.nextVertexIndex = 0;
        }
        else{
            this.nextVertexIndex++;
        }
    }
    public SetMovable(movable: Movable): void{
        this.movable = movable;
    }
    public StartMoving(): void{
        if(!this.isActive){
            this.currentVertexIndex = 0;
            this.nextVertexIndex = 1;
            this.isActive = true;
        }
    }
    public StopMoving(): void{
        if(this.isActive){
            this.isActive = false;
            this.movable = null;
        }
    }

    public Tick(deltaTime: number): void{
        if (this.isActive){
            let currentVertex = this.getVertices()[this.currentVertexIndex];
            let nextVertex = this.getVertices()[this.nextVertexIndex];
            let movablePosition = this.movable.getAbsoluteLocation();
            let movableToNext = nextVertex.subtract(movablePosition);
            let movableToNextLength = movableToNext.length();
            if (movableToNextLength < this.closeEnough){
                this.movable.setLocation(nextVertex);
                this.switchVertexIndex();
            }
            else{
                let movableToNextUnit = movableToNext.normalize();
                //console.log("movableToNextUnit " + movableToNextUnit.toString());
                this.movable.move(movableToNextUnit, deltaTime);
                this.movable.turn(deltaTime);
            }
        }
    }
}