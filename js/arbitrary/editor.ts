/// <reference path="../common/graph.ts"/>
/// <reference path="../common/drawingPlane.ts"/>
/// <reference path="../common/editor.ts"/>

class ArbitraryCurveGraph extends BaseCurveGraph{
    private bernstein(n: number, i:number, t: number): number{
        let binom = 1;
        for (let x = n-i+1; x <= n; x++) binom *= x;
        for (let x = 1; x <= i; x++) binom /= x;
        //console.log(binom, Math.pow(t, i), Math.pow(1-t, n-i), "n", n, i ,t);
        return binom * Math.pow(t, i) * Math.pow(1-t, n-i);
    }
    private vectorAtT(vertices: BABYLON.Vector3[], t:number) : BABYLON.Vector3{
        let n = vertices.length;
        let res = new BABYLON.Vector3(0,0,0);
        for(var i = 0; i <= n-1; i += 1) {
            let b = this.bernstein(n-1,i,t);
            //console.log("b", b, "vertex", vertices[i]);
            let next = vertices[i].multiplyByFloats(b,b,b );
            res.addInPlace(next);
        }
        
        return res;
    }
    private arbitraryBezier(vertices: BABYLON.Vector3[], nb:number): BABYLON.Vector3[]{
        let bez:BABYLON.Vector3[]  = [];
	    var step = 1 / nb;
        for(var i = 0; i <= 1; i += step) {
	    bez.push( this.vectorAtT(vertices, i));
	  }
      return bez;
    }
    protected initCurves(): void{
        if (this.points.length < 2){
            return;
        }
        let curvePoints = this.arbitraryBezier(this.points, 50);
        this.curves[0] = BABYLON.Mesh.CreateLines("name", curvePoints, this.scene, true);
    }
    protected updateSpline(pointIndex:number): void{
        if (this.points.length <2 ){
            return;
        }
        let curvePoints = this.arbitraryBezier(this.points, 50);
        this.curves[0] = BABYLON.Mesh.CreateLines("name", curvePoints, this.scene, true, this.curves[0]);
        
    }
}

class LongArbitraryCurvePlance extends SimpleCurvePlane {
    constructor(name: string, width: number, height: number, scene: BABYLON.Scene, graph?: InteractiveGraph) {
        super(name, 1300, 600, scene, graph);
        this.graph = new ArbitraryCurveGraph("arbitrary", [], scene, 0);
    }
}

class ArbitraryCurveEditor{
    protected curvePlane: LongArbitraryCurvePlance;
    private name: string;
    private scene: BABYLON.Scene;
    constructor(name:string, scene: BABYLON.Scene){
        this.scene = scene;
        this.name = name;
        this.curvePlane = new LongArbitraryCurvePlance("plane", 0, 0, scene);
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