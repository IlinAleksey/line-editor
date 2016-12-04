/// <reference path="../common/graph.ts"/>
/// <reference path="../common/drawingPlane.ts"/>
/// <reference path="../common/editor.ts"/>

class Approximator {
    private points: BABYLON.Vector3[];
    private b_arr: number[][];
    private length: number[];
    private lengthSumm: number;
    private bSmall: number;
    private cSmall: number;
    private eSmall: number;

    private a1Small: number;
    private d1Small: number;
    private a2Small: number;
    private d2Small: number;

    private x1: number;
    private y1: number;

    private x2: number;
    private y2: number;

    public constructor(){
        this.points = [];
    }

    public ApproximateAndDrawBezier(points: BABYLON.Vector3[]): BABYLON.Vector3[] {
        this.points = points;
        this.CalculateLength();
        console.log("CalculateLength", this);
        this.CalculateBArr();
console.log("CalculateBArr", this);
        this.CalculateParameters();
console.log("CalculateParameters", this);
        this.CalculateXandY();
        console.log("CalculateXandY", this);
        let bez = [points[0], new BABYLON.Vector3(this.x1, this.y1, 0), new BABYLON.Vector3(this.x2, this.y2, 0), points[points.length - 1]];
        return bez;
    }

    private CalculateXandY(): void {
        this.x1 = (this.a1Small * this.eSmall - this.d1Small * this.cSmall) / (this.bSmall * this.eSmall - this.cSmall * this.cSmall);
        this.x2 = (this.bSmall * this.d1Small - this.cSmall * this.a1Small) / (this.bSmall * this.eSmall - this.cSmall * this.cSmall);

        this.y1 = (this.a2Small * this.eSmall - this.d2Small * this.cSmall) / (this.bSmall * this.eSmall - this.cSmall * this.cSmall);
        this.y2 = (this.bSmall * this.d2Small - this.cSmall * this.a2Small) / (this.bSmall * this.eSmall - this.cSmall * this.cSmall);
    }

    private CalculateParameters(): void {
        this.CalculateBSmall();
        this.CalculateCSmall();
        this.CalculateESmall();

        this.CalculateA1Small();
        this.CalculateD1Small();

        this.CalculateA2Small();
        this.CalculateD2Small();
    }


    private CalculateA1Small(): void {
        this.a1Small = 0;

        for (let i = 0; i < this.points.length; i++) {
            this.a1Small += this.points[i].x * this.b_arr[1][i] - this.points[0].x * this.b_arr[0][i] * this.b_arr[1][i] -
                this.points[this.points.length - 1].x * this.b_arr[3][i] * this.b_arr[1][i];
        }
    }

    private CalculateD1Small(): void {
        this.d1Small = 0;
        for (let i = 0; i < this.points.length; i++) {
            this.d1Small += this.points[i].x * this.b_arr[2][i] - this.points[0].x * this.b_arr[0][i] * this.b_arr[2][i] -
                this.points[this.points.length - 1].x * this.b_arr[3][i] * this.b_arr[2][i];
        }
    }

    private CalculateA2Small(): void {
        this.a2Small = 0;

        for (let i = 0; i < this.points.length; i++) {
            this.a2Small += this.points[i].y * this.b_arr[1][i] - this.points[0].y * this.b_arr[0][i] * this.b_arr[1][i] -
                this.points[this.points.length - 1].y * this.b_arr[3][i] * this.b_arr[1][i];
        }
    }

    private CalculateD2Small(): void {
        this.d2Small = 0;
        for (let i = 0; i < this.points.length; i++) {
            this.d2Small += this.points[i].y * this.b_arr[2][i] - this.points[0].y * this.b_arr[0][i] * this.b_arr[2][i] -
                this.points[this.points.length - 1].y * this.b_arr[3][i] * this.b_arr[2][i];
        }
    }

    private CalculateBSmall(): void {
        this.bSmall = 0;
        for (let i = 0; i < this.points.length; i++) {
            this.bSmall = this.bSmall + this.b_arr[1][i] * this.b_arr[1][i];
        }
    }

    private CalculateCSmall(): void {
        this.cSmall = 0;

        for (let i = 0; i < this.points.length; i++) {
            this.cSmall = this.cSmall + this.b_arr[2][i] * this.b_arr[1][i];
        }
    }

    private CalculateESmall(): void {
        this.eSmall = 0;

        for (let i = 0; i < this.points.length; i++) {
            this.eSmall = this.eSmall + this.b_arr[2][i] * this.b_arr[2][i];
        }
    }

    private CalculateLength(): void {
        this.lengthSumm = 0;
        this.length = [];
        for (let i = 0; i < this.points.length - 1; i++) {
            this.length[i] = this.lengthSumm;
            let currLength: number = Math.sqrt(Math.pow(this.points[i + 1].x - this.points[i].x, 2) + Math.pow(this.points[i + 1].y - this.points[i].y, 2));
            this.lengthSumm += currLength;
        }
        this.length[this.points.length - 1] = this.lengthSumm;
    }

    private CalculateBArr(): void {
        this.b_arr = [];
        for (let i = 0; i < 4; i++) {
            this.b_arr[i] = [];
            for (let j = 0; j < this.points.length; j++) {
                console.log(i, this.length[j] , this.lengthSumm);
                let num = this.B(i, this.length[j] / this.lengthSumm);
                console.log(num);
                this.b_arr[i][j] = this.B(i, this.length[j] / this.lengthSumm);
                
            }
        }
    }

    private B(j: number, i: number): number {
        switch (j) {
            case 0:
                return this.B0(i);
            case 1:
                return this.B1(i);
            case 2:
                return this.B2(i);
            case 3:
                return this.B3(i);
            default:
                return -1;
        }
    }

    private B0(arg: number): number {
        return Math.pow(1 - arg, 3);
    }
    private B1(arg: number): number {
        return 3 * Math.pow(1 - arg, 2) * arg;
    }
    private B2(arg: number): number {
        return 3 * (1 - arg) * Math.pow(arg, 2);
    }
    private B3(arg: number): number {
        return Math.pow(arg, 3);
    }

}

class ApproximateCurveGraph extends BaseCurveGraph {
    private approximator: Approximator;
    constructor(name:string, points: BABYLON.Vector2[], scene: BABYLON.Scene, graphIndex: number = 0){
        super(name, points, scene, graphIndex);
        this.approximator = new Approximator();
    }
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
      bez.push(vertices[vertices.length - 1]);
      return bez;
    }
    protected initCurves(): void{
        if (this.points.length < 4){
            return;
        }
        let actualPoints = this.approximator.ApproximateAndDrawBezier(this.points);
        let curvePoints = this.arbitraryBezier(actualPoints, 50);
        this.curves[0] = BABYLON.Mesh.CreateLines("name", curvePoints, this.scene, true);
    }
    protected updateSpline(pointIndex:number): void{
        if (this.points.length <4 ){
            return;
        }
        let actualPoints = this.approximator.ApproximateAndDrawBezier(this.points);
        console.log(actualPoints);
        let curvePoints = this.arbitraryBezier(actualPoints, 50);
        this.curves[0] = BABYLON.Mesh.CreateLines("name", curvePoints, this.scene, true, this.curves[0]);
        
    }
}

class LongApproximateCurvePlance extends SimpleCurvePlane {
    constructor(name: string, width: number, height: number, scene: BABYLON.Scene, graph?: InteractiveGraph) {
        super(name, 1300, 600, scene, graph);
        this.graph = new ApproximateCurveGraph("approximate", [], scene, 0);
    }
}

class ApproximateCurveEditor {
    protected curvePlane: LongApproximateCurvePlance;
    private name: string;
    private scene: BABYLON.Scene;
    constructor(name: string, scene: BABYLON.Scene) {
        this.scene = scene;
        this.name = name;
        this.curvePlane = new LongApproximateCurvePlance("plane", 0, 0, scene);
    }
    public onPointerDown(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        this.curvePlane.onPointerDown(evt, pickingInfo);
    }
    public onPointerUp(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        this.curvePlane.onPointerUp(evt, pickingInfo);
    }
    public onPointerMove(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        this.curvePlane.onPointerMove(evt, pickingInfo);
    }

    public saveJsonData(): string {
        return this.curvePlane.saveJsonData();
    }

    public loadJsonData(json: string): void {
        this.curvePlane.loadJsonData(json);
    }

    public loadVectorData(vectorData: Vector[]): void {
        this.curvePlane.loadVectorData(vectorData);
    }
}