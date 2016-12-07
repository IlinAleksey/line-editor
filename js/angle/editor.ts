/// <reference path="../common/graph.ts"/>
/// <reference path="../common/drawingPlane.ts"/>
/// <reference path="../common/editor.ts"/>

class PolygonGraph extends BaseCurveGraph {
    protected closed: boolean;
    constructor(name: string, points: BABYLON.Vector2[], scene: BABYLON.Scene, graphIndex: number = 0) {
        super(name, points, scene, graphIndex);
        this.closed = false;
    }
    protected initCurves(): void {
        if (this.points.length < 3) {
            return;
        }
        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);
    }
    protected pointAddedUpdateSpline(): void {
        if (this.points.length < 3) {
            return;
        }
        if (this.curves[0]) {
            this.curves[0].dispose();
        }

        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);

    }
    protected updateSpline(pointIndex: number) {
        if (this.points.length < 3) {
            return;
        }
        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true, this.curves[0]);
    }
    protected cross(A: BABYLON.Vector3, B: BABYLON.Vector3, C: BABYLON.Vector3): number {
        return (B.x - A.x) * (C.y - B.y) - (B.y - A.y) * (C.x - B.x);
    }
    public getVertices(): BABYLON.Vector3[] {
        let A = this.points[0];
        let B = this.points[1];
        let clockwise: boolean = false;
        for (let i =2; i< this.points.length - 1; i++){
            let C = this.points[i];
            let z = this.cross(A,B,C);
            if (z != 0){
                clockwise = z > 0;
                break;
            }
        }
        let newPoints: BABYLON.Vector3[] = [];
        console.log(this.points);
        if (clockwise){
            for (let i =0; i< this.points.length - 1; i++){
                newPoints.push(this.points[i]);
            }
        }
        else{
            for (let i =this.points.length - 2; i>= 0; i--){
                newPoints.push(this.points[i]);
            }
        }
        return newPoints;
    }
    public updateGraphPoint(pointIndex: number, newPosition: BABYLON.Vector3): void {
        if (pointIndex == 0 && this.closed) {
            this.points[pointIndex] = newPosition;
            this.points[this.points.length - 1] = newPosition;
        }
        else {
            this.points[pointIndex] = newPosition;
        }
        this.discs[pointIndex].position = newPosition, 1;

        this.updateSpline(pointIndex);
    }
    public closeGraph(): void {
        if (this.points.length >= 3) {
            this.closed = true;
            let point = this.points[0];
            this.points.push(point);
            this.curves[0].dispose();
            this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);
        }
    }
}

class SinglePointGraph extends BaseCurveGraph {
    constructor(name: string, points: BABYLON.Vector2[], scene: BABYLON.Scene, graphIndex: number = 0) {
        super(name, points, scene, graphIndex, BABYLON.Color3.Green());
    }
    protected initCurves(): void {
        if (this.points.length > 1) {
            return;
        }
        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);
    }
    protected pointAddedUpdateSpline(): void {
        if (this.points.length > 1) {
            return;
        }
        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);
    }
    public getVertices(): BABYLON.Vector3[] {
        return this.points;
    }
}

class PolygonPlane extends SimpleCurvePlane {
    protected drawingPolygon: boolean;
    protected singlePointGraph: SinglePointGraph;
    private lmbPressed: boolean;
    private currentCurveIndex: number;
    constructor(name: string, width: number, height: number, scene: BABYLON.Scene, graph?: InteractiveGraph) {
        super(name, 1300, 600, scene, graph);
        this.graph = new PolygonGraph("Polygon", [], scene, 0);
        this.drawingPolygon = true;
        this.singlePointGraph = new SinglePointGraph("Single Point", [], scene, 1);
        this.lmbPressed = false;
    }
    public finishDrawing() {
        this.drawingPolygon = false;
        this.graph.closeGraph();
    }
    public onPointerMove(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        if (this.lmbPressed) {
            let newPosition: BABYLON.Vector3 = null;
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => { return mesh.name == this.plane.name; });
            if (pickinfo.hit) {
                newPosition = pickinfo.pickedPoint;
            }

            if (newPosition) {
                if (this.currentCurveIndex == 0) {
                    this.graph.updateGraphPoint(this.currentPointIndex, newPosition);
                }
                else {
                    this.singlePointGraph.updateGraphPoint(this.currentPointIndex, newPosition);
                }
            }

        }

    }
    public onPointerUp(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        this.lmbPressed = false;
    }
    public onPointerDown(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        //super.onPointerDown(evt, pickingInfo);
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh.name == "disc"; });
        if (pickinfo.hit) {

            console.log((<any>pickinfo.pickedMesh).index);
            this.currentPointIndex = (<any>pickinfo.pickedMesh).index;
            this.currentCurveIndex = (<any>pickinfo.pickedMesh).curveIndex;
            this.lmbPressed = true;
            console.log("onPointerDown", this.currentPointIndex);

        }
        else {
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== this.plane; });
            if (pickinfo.hit) {
                if (this.drawingPolygon) {
                    this.graph.addPoint(pickingInfo.pickedPoint);
                }
                else {
                    this.singlePointGraph.addPoint(pickingInfo.pickedPoint);
                }

            }
        }


    }
    protected cross(A: BABYLON.Vector3, B: BABYLON.Vector3, C: BABYLON.Vector3): number {
        return (B.x - A.x) * (C.y - B.y) - (B.y - A.y) * (C.x - B.x);
    }
    protected intersect(A: BABYLON.Vector3,B: BABYLON.Vector3,C: BABYLON.Vector3,D: BABYLON.Vector3): boolean{
        return this.cross(A,B,C)*this.cross(A,B,D)<=0 && this.cross(C,D,A)*this.cross(C,D,B)<0
    }
  
    protected pointloc(P: BABYLON.Vector3[], A: BABYLON.Vector3): boolean{
        let n = P.length;
        if (this.cross(P[0],P[1],A)<0 || this.cross(P[0],P[n-1],A)>0){
            return false;
        }
        let p = 1;
        let r = n - 1;
        while (r - p > 1){
            let q = Math.floor((p + r) / 2);
            console.log(this.cross(P[0], P[q], A), q, P[q], A)
            if (this.cross(P[0], P[q], A) < 0){
                r = q;
            }
            else{
                p = q;
            }
        }
        return !(this.intersect(P[0], A, P[p], P[r]));
    }
  
    public isPointInsidePolygon(): boolean {
        let polygonPoints: BABYLON.Vector3[] = this.graph.getVertices();
        let testPoint: BABYLON.Vector3 = this.singlePointGraph.getVertices()[0];
        if (polygonPoints == undefined){
            return false;
        }
        if (testPoint == undefined){
            return false;
        }
        let res = this.pointloc(polygonPoints, testPoint);
        console.log(polygonPoints, testPoint, res);
        return res;
    }
}

class PolygonEditor {
    protected curvePlane: PolygonPlane;
    private name: string;
    private scene: BABYLON.Scene;
    constructor(name: string, scene: BABYLON.Scene) {
        this.scene = scene;
        this.name = name;
        this.curvePlane = new PolygonPlane("plane", 0, 0, scene);
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

    public closeGraph(): void {
        this.curvePlane.finishDrawing();
    }

    public isPointInsidePolygon(): boolean {
        return this.curvePlane.isPointInsidePolygon();
    }
}