/// <reference path="./actor.ts"/>
interface InteractiveGraph{
    addPoint(point: BABYLON.Vector3) : void;
    closeGraph(): void;
    getVertices(): BABYLON.Vector3[];
    updateGraphPoint(pointIndex: number, newPosition: BABYLON.Vector3): void;
    save(): string;
    load(json: string): void;
    loadVectorData(vectorData: Vector[]): void;
}

class GraphPoint extends BABYLON.Mesh{
    public index;
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

    public updateGraphPoint(pointIndex: number, newPosition: BABYLON.Vector3){

    }

    public save(): string {return "";}
    public load(json: string): void {}
    loadVectorData(vectorData: Vector[]): void {}
}

abstract class BaseCurveGraph implements InteractiveGraph{
    protected points: BABYLON.Vector3[];
    protected curves: BABYLON.LinesMesh[];
    protected discs: any[];
    protected scene: BABYLON.Scene;
    private cubicBezier(v0: BABYLON.Vector3, v1: BABYLON.Vector3, v2: BABYLON.Vector3, v3: BABYLON.Vector3, nb: number){
        let bez:BABYLON.Vector3[]  = [];
	    var step = 1 / nb;
	  var equation = function(t, val0, val1, val2, val3) {
	    var res = (1 -t)*(1-t)*(1-t) * val0 + 3 * t * (1-t)*(1-t) * val1 + 3 * t*t *(1-t) * val2 + t*t*t * val3;
	    return res;
	  };
	  for(var i = 0; i <= 1; i += step) {
	    bez.push( new BABYLON.Vector3(equation(i, v0.x, v1.x, v2.x, v3.x), equation(i, v0.y, v1.y, v2.y, v3.y), equation(i, v0.z, v1.z, v2.z, v3.z)) );
	  }
	  bez.push(v3);
	  return bez;
    }
    private initCurves(){
        let pointsCount = this.points.length;
        if (pointsCount < 4){
            return;
        }
        let cubicGroupCount = Math.floor((pointsCount + 1) / 4);
        console.log("cubicGroupCount", cubicGroupCount);
        for (let index = 0; index < cubicGroupCount; index++) {
            let curIndex: number = index;
            let curvePoints = this.cubicBezier(this.points[index * 3 + 0], this.points[index * 3 + 1],this.points[index * 3 + 2],this.points[index * 3 + 3], 50);
            // curIndex++;
            // if (curIndex < this.points.length){
            //     curvePoints.push(this.points[curIndex]);
            //     curIndex++;
            //     if (curIndex < this.points.length){
            //         curvePoints.push(this.points[curIndex]);
            //     }
            // }
            console.log(curvePoints);
            
            this.curves[index/4] =  BABYLON.Mesh.CreateLines("name", curvePoints, this.scene, true);
        }
    }
    constructor(name:string, points: BABYLON.Vector2[], scene: BABYLON.Scene){
        this.scene = scene;
        this.points = [];
        this.discs = [];
        for (var p of points){
            let point: BABYLON.Vector3 = new BABYLON.Vector3(p.x, p.y, 0);
            this.points.push(point);

            let disc: BABYLON.Mesh = BABYLON.Mesh.CreateDisc("disc", 20, 20, this.scene);
            disc.translate(point, 1);
            var material = new BABYLON.StandardMaterial("material01", scene);
            material.emissiveColor = BABYLON.Color3.Red();
            disc.material = material;
            this.discs.push(disc);
            this.discs[this.discs.length - 1].index = this.discs.length - 1;
            
        }
        this.curves = [];
        this.initCurves();
    }
    public addPoint(point: BABYLON.Vector3) : void{

            this.points.push(point);

            let disc: BABYLON.Mesh = BABYLON.Mesh.CreateDisc("disc", 20, 20, this.scene);
            // let elevatedPoint = BABYLON
            disc.translate(point, 1);
            var material = new BABYLON.StandardMaterial("material01", scene);
            material.emissiveColor = BABYLON.Color3.Red();
            disc.material = material;
            this.discs.push(disc);
            console.log("BaseCurveGraph::addPoint ", this.discs.length);
            this.discs[this.discs.length - 1].index = this.discs.length - 1;

            this.updateSpline(this.discs.length - 1);

    }
    protected updateCubicGroup(cubicGroup: number){
        let curvePoints1 = this.cubicBezier(
                this.points[cubicGroup * 3 + 0], 
                this.points[cubicGroup * 3 + 1], 
                this.points[cubicGroup * 3 + 2], 
                this.points[cubicGroup * 3 + 3], 
                50);
                this.curves[cubicGroup] = BABYLON.Mesh.CreateLines("name", curvePoints1, this.scene, true, this.curves[cubicGroup]);
    }
    protected updateSpline(pointIndex:number): void{
        if (this.points.length < 4){
            return;
        }
        let rem = pointIndex % 3;
        if (rem == 0 && pointIndex > 0){
            let cubicGroup1 = Math.floor(pointIndex / 3);
            let cubicGroup2 = cubicGroup1 - 1;
            if (pointIndex + 3 < this.points.length){
                let curvePoints1 = this.cubicBezier(
                this.points[cubicGroup1 * 3 + 0], 
                this.points[cubicGroup1 * 3 + 1], 
                this.points[cubicGroup1 * 3 + 2], 
                this.points[cubicGroup1 * 3 + 3], 
                50);
                this.curves[cubicGroup1] = BABYLON.Mesh.CreateLines("name", curvePoints1, this.scene, true, this.curves[cubicGroup1]);
            }
            
            let curvePoints2 = this.cubicBezier(
                this.points[cubicGroup2 * 3 + 0], 
                this.points[cubicGroup2 * 3 + 1], 
                this.points[cubicGroup2 * 3 + 2], 
                this.points[cubicGroup2 * 3 + 3], 
                50);
            this.curves[cubicGroup2] = BABYLON.Mesh.CreateLines("name", curvePoints2, this.scene, true, this.curves[cubicGroup2]);

        } else{
            let cubicGroup = Math.floor(pointIndex / 3);
            if ((cubicGroup+1) * 3 < this.points.length){
                this.updateCubicGroup(cubicGroup);
            }
            
        }
    }

    public updateGraphPoint(pointIndex: number, newPosition: BABYLON.Vector3) : void{
        this.points[pointIndex] = newPosition;
        this.discs[pointIndex].position = newPosition, 1;

        this.updateSpline(pointIndex);
    }
    public closeGraph(): void{
        
    }
    public getVertices(): BABYLON.Vector3[]{
        return this.points;

    }

    public clear(){
        this.points = [];
        while(this.curves.length > 0) {
            let curve = this.curves.pop();
            curve.dispose();
        }
        while(this.discs.length > 0) {
            let disc = this.discs.pop();
            disc.dispose();
        }
    }
    public save(): string {return JSON.stringify(this.points);}
    public load(json: string): void {
        let tempAny: any[] = JSON.parse(json);

        console.log(tempAny);
        this.clear();
        for (let point of tempAny){
            let tempPoint = new BABYLON.Vector3(0,0,0);
            tempPoint.copyFrom(point);
            this.addPoint(tempPoint);
        }
    }
    public loadVectorData(vectorData: Vector[]): void{
        this.clear();
        for (let point of vectorData){
            let tempPoint = new BABYLON.Vector3(0,0,0);
            tempPoint.copyFrom(<any>point);
            this.addPoint(tempPoint);
        }
    }
}

class SimpleCurveGraph extends BaseCurveGraph{

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