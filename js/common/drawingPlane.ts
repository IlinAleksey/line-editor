/// <reference path="./graph.ts"/>
interface DrawingPlane {
    addPoint(point: BABYLON.Vector3): void;
    onPointerDown(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void;
    finishDrawing(): void;
    disableEditing(): void;
    enableEditing(): void;
}

interface MovableEditor {
    buildMovable(name: string, scene: BABYLON.Scene): Movable;
}

interface PathEditor {
    startMoving(movable: Movable): void;
    update(deltaTime: number): void;
}

abstract class BaseInteractiveGraphPlane implements DrawingPlane {
    protected isActive: boolean;
    protected graph: InteractiveGraph;
    constructor() {
        this.isActive = true;
    }
    addPoint(point: BABYLON.Vector3): void {
        if (this.isActive) {
            this.graph.addPoint(point);
        }

    }
    finishDrawing(): void {
        if (this.isActive) {
            this.graph.closeGraph();
            this.isActive = false;
        }
    }
    disableEditing(): void {
        this.isActive = false;
    }
    enableEditing(): void {
        this.isActive = true;
    }
    abstract onPointerDown(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void;
}

class SimpleInteractiveGraphPlane extends BaseInteractiveGraphPlane {
    protected plane: BABYLON.Mesh;
    protected scene: BABYLON.Scene;
    public graph: InteractiveGraph;
    constructor(name: string, width: number, height: number, scene: BABYLON.Scene, graph?: InteractiveGraph) {
        super();
        this.scene = scene;
        this.plane = BABYLON.Mesh.CreateGround(name, width, height, 2, scene);
        this.plane.translate(new BABYLON.Vector3(1, 0, 0), 0);
        this.plane.rotate(new BABYLON.Vector3(1, 0, 0), -Math.PI / 2);
        if (graph) {
            this.graph = graph;
        }

    }

    public onPointerDown(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {

        if (pickingInfo.hit) {
            if (pickingInfo.pickedMesh == this.plane && evt.button == 0) {

                this.addPoint(pickingInfo.pickedPoint);
            }
        }
    }

}

class SimpleCurvePlane extends SimpleInteractiveGraphPlane {
    private rmbPressed: boolean;
    protected currentPointIndex: number;
    constructor(name: string, width: number, height: number, scene: BABYLON.Scene, graph?: InteractiveGraph) {
        super(name, width, height, scene, graph);
        this.graph = new SimpleCurveGraph(name, [], scene);
        this.rmbPressed = false;
    }
    public onPointerMove(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        if (this.rmbPressed) {
            if (this.graph) {
                let newPosition: BABYLON.Vector3 = null;
                var pickinfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => { return mesh.name == this.plane.name; });
                if (pickinfo.hit) {
                    newPosition = pickinfo.pickedPoint;
                }

                if (newPosition) {
                    this.graph.updateGraphPoint(this.currentPointIndex, newPosition);
                }

            }
        }
    }
    public onPointerUp(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        this.rmbPressed = false;
    }
    public onPointerDown(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        //super.onPointerDown(evt, pickingInfo);
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh.name == "disc"; });
        if (pickinfo.hit) {

            let indexMesh = pickingInfo.pickedMesh as any;
            this.currentPointIndex = (<any>pickinfo.pickedMesh).index;
            this.rmbPressed = true;

        }
        else {
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== this.plane; });
            if (pickinfo.hit) {

                this.addPoint(pickingInfo.pickedPoint);

            }
        }


    }
    public saveJsonData(): string {
        return this.graph.save();
    }

    public loadJsonData(json: string): void {
        this.graph.load(json);
    }
    public loadVectorData(vectorData: Vector[]): void {
        this.graph.loadVectorData(vectorData);
    }
}

class LongSimpleCurvePlane extends SimpleCurvePlane {
    constructor(name: string, width: number, height: number, scene: BABYLON.Scene, graph?: InteractiveGraph) {
        super(name, 1300, 600, scene, graph);
    }
}

class ComplexCurvePlane extends SimpleInteractiveGraphPlane {
    private currentPointIndex: number;
    private currentCurveIndex: number;
    private lmbPressed: boolean;
    private curveArray: SimpleCurveGraph[];
    constructor(name: string, width: number, height: number, scene: BABYLON.Scene, graph?: InteractiveGraph) {
        super(name, 1300, 600, scene, graph);
        this.curveArray = new Array<SimpleCurveGraph>();
        this.lmbPressed = false;
        this.currentCurveIndex = 0;
    }
    public onPointerMove(evt: PointerEvent, pickingInfo: BABYLON.PickingInfo): void {
        if (this.lmbPressed) {
            let newPosition: BABYLON.Vector3 = null;
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => { return mesh.name == this.plane.name; });
            if (pickinfo.hit) {
                newPosition = pickinfo.pickedPoint;
            }

            if (newPosition) {
                if (this.curveArray[this.currentCurveIndex]) {
                    this.curveArray[this.currentCurveIndex].updateGraphPoint(this.currentPointIndex, newPosition);
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
            this.currentPointIndex = (<any>pickinfo.pickedMesh).index;
            this.currentCurveIndex = (<any>pickinfo.pickedMesh).curveIndex;
            this.lmbPressed = true;

        }
        else {
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== this.plane; });
            if (pickinfo.hit) {
                this.curveArray[this.currentCurveIndex].addPoint(pickingInfo.pickedPoint);

            }
        }


    }
    public saveJsonData(): string {
        return this.graph.save();
    }

    public loadJsonData(json: string): void {
        this.graph.load(json);
    }
    public loadVectorData(vectorData: Vector[]): void {
        this.graph.loadVectorData(vectorData);
    }
    public loadComplexVectorData(complexVectorData: Vector[][]): void {
        for (let index = 0; index < complexVectorData.length; index++) {
            this.curveArray[index] = new SimpleCurveGraph(name, [], scene, index);
            this.curveArray[index].loadVectorData(complexVectorData[index]);
        }
    }
}

class SimplePathPlane extends SimpleInteractiveGraphPlane implements PathEditor {
    protected pathGraph: SimplePath;
    constructor(name: string, width: number, height: number, scene: BABYLON.Scene, graph?: InteractiveGraph) {
        super(name, width, height, scene);
        this.pathGraph = new SimplePath("lines", [], scene);
        this.graph = this.pathGraph;
    }
    startMoving(movable: Movable): void {
        this.pathGraph.SetMovable(movable);
        this.pathGraph.StartMoving();
    }
    update(deltaTime: number): void {
        this.pathGraph.Tick(deltaTime);
    }
}

class SimpleMovablePlane extends SimpleInteractiveGraphPlane implements MovableEditor {
    constructor(name: string, width: number, height: number, scene: BABYLON.Scene, graph?: InteractiveGraph) {
        super(name, width, height, scene);
        this.graph = new SimplePath("lines", [], scene);
    }
    public buildMovable(name: string, scene: BABYLON.Scene): Movable {
        let points = this.graph.getVertices();
        let points2D: BABYLON.Vector2[] = [];
        for (var point of points) {
            points2D.push(new BABYLON.Vector2(point.x, point.y));
        }
        return new LinAlgMovable(name, points2D, scene);
    }
}