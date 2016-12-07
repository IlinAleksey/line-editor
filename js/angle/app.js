var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Movable = (function () {
    function Movable() {
    }
    Movable.prototype.toRadians = function (degrees) {
        return degrees * (Math.PI / 180);
    };
    Movable.prototype.move = function (direction, deltaTime) {
        var delta = this.linearSpeed * deltaTime;
        this.addTranslation(direction.multiplyByFloats(delta, delta, delta));
    };
    Movable.prototype.turn = function (deltaTime) {
        var deltaAngle = this.angularSpeed * deltaTime;
        this.addZRotation(deltaAngle);
    };
    return Movable;
}());
var BaseLineMovable = (function (_super) {
    __extends(BaseLineMovable, _super);
    function BaseLineMovable(name, points2d, scene) {
        _super.call(this);
        this.scene = scene;
        this.fuck = [];
        console.log(this);
        for (var _i = 0, points2d_1 = points2d; _i < points2d_1.length; _i++) {
            var p = points2d_1[_i];
            this.fuck.push(new BABYLON.Vector3(p.x, p.y, 0));
        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.fuck, scene, true);
    }
    BaseLineMovable.prototype.destroy = function () {
        this.lineMesh.dispose();
    };
    return BaseLineMovable;
}(Movable));
var SimpleMovable = (function (_super) {
    __extends(SimpleMovable, _super);
    function SimpleMovable() {
        _super.apply(this, arguments);
    }
    SimpleMovable.prototype.setLocation = function (position) {
        var position3d = new BABYLON.Vector3(position.x, position.y, 0);
        var current = this.lineMesh.getAbsolutePosition();
        var diff2 = position3d.subtract(current);
        this.lineMesh.translate(diff2, 1, BABYLON.Space.WORLD);
    };
    SimpleMovable.prototype.addTranslation = function (position) {
        var current = this.getAbsoluteLocation();
        this.setLocation(current.add(position));
    };
    SimpleMovable.prototype.getAbsoluteLocation = function () {
        return this.lineMesh.getAbsolutePosition();
    };
    SimpleMovable.prototype.setZRotation = function (angle) {
        var radians = this.toRadians(angle);
        this.lineMesh.rotate(BABYLON.Axis.Z, radians, BABYLON.Space.LOCAL);
    };
    SimpleMovable.prototype.addZRotation = function (angle) {
        var current = this.getZRotation();
        this.setZRotation(current + angle);
    };
    SimpleMovable.prototype.getZRotation = function () {
        return this.lineMesh.rotation.z;
    };
    return SimpleMovable;
}(BaseLineMovable));
var LinAlgMovable = (function (_super) {
    __extends(LinAlgMovable, _super);
    function LinAlgMovable(name, points2d, scene) {
        _super.call(this, name, points2d, scene);
        //console.log(this);
        this.linearSpeed = 0.1;
        this.angularSpeed = 0.1;
    }
    LinAlgMovable.prototype.rotateVectorAroundOrigin = function (vector, angle) {
        return new BABYLON.Vector3(vector.x * Math.cos(angle) - vector.y * Math.sin(angle), vector.y * Math.cos(angle) + vector.x * Math.sin(angle), 0);
    };
    LinAlgMovable.prototype.rotateAroundOrigin = function (vector, pivot, angle) {
        console.log("rotateAroundOrigin " + vector + pivot + angle);
        var translated = vector.subtract(pivot);
        var rotated = this.rotateVectorAroundOrigin(translated, angle);
        var translatedBack = rotated.add(pivot);
        translatedBack.z = 0;
        return translatedBack;
    };
    LinAlgMovable.prototype.addAngleToRotation = function (angle) {
        this.rotation += angle;
        if (this.rotation > Math.PI) {
            this.rotation -= 2 * Math.PI;
        }
        else if (this.rotation < Math.PI) {
            this.rotation += 2 * Math.PI;
        }
    };
    LinAlgMovable.prototype.getAverage = function () {
        var sum = new BABYLON.Vector3(0, 0, 0);
        for (var _i = 0, _a = this.fuck; _i < _a.length; _i++) {
            var position = _a[_i];
            sum = sum.add(position);
        }
        //console.log("average");
        //console.log(this.fuck.toString());
        var average = sum.divide(new BABYLON.Vector3(this.fuck.length, this.fuck.length, 1));
        return average;
    };
    LinAlgMovable.prototype.getAbsoluteLocation = function () {
        return this.getAverage();
    };
    LinAlgMovable.prototype.setLocation = function (position) {
        var position3d = new BABYLON.Vector3(position.x, position.y, 0);
        var average = this.getAbsoluteLocation();
        var diff = position3d.subtract(average);
        diff.z = 0;
        this.addTranslation(diff);
    };
    LinAlgMovable.prototype.addTranslation = function (position) {
        //console.log("addTranslation position: " + position.toString());
        for (var index in this.fuck) {
            this.fuck[index].addInPlace(position);
        }
        //console.log("addTranslation");
        //console.log(this.fuck.toString());
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.fuck, scene, true, this.lineMesh);
    };
    LinAlgMovable.prototype.setZRotation = function (angle) {
        var cur = this.getZRotation();
        var diff = angle - cur;
        this.addZRotation(diff);
    };
    LinAlgMovable.prototype.addZRotation = function (angle) {
        //console.log("angle " + angle);
        var radians = this.toRadians(angle);
        this.addAngleToRotation(radians);
        var pivot = this.getAverage();
        for (var index in this.fuck) {
            this.fuck[index] = this.rotateAroundOrigin(this.fuck[index], pivot, radians);
        }
        //console.log("addZRotation");
        //console.log(this.fuck.toString());
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.fuck, scene, true, this.lineMesh);
    };
    LinAlgMovable.prototype.getZRotation = function () {
        return this.rotation;
    };
    return LinAlgMovable;
}(BaseLineMovable));
/// <reference path="./actor.ts"/>
var GraphPoint = (function (_super) {
    __extends(GraphPoint, _super);
    function GraphPoint() {
        _super.apply(this, arguments);
    }
    return GraphPoint;
}(BABYLON.Mesh));
var BaseLineGraph = (function () {
    function BaseLineGraph(name, points, scene) {
        this.scene = scene;
        this.points = [];
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            this.points.push(new BABYLON.Vector3(p.x, p.y, 0));
        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.points, scene, true);
    }
    BaseLineGraph.prototype.addPoint = function (point) {
        this.points.push(point);
        this.lineMesh = BABYLON.Mesh.CreateLines(this.name, this.points, this.scene, true);
    };
    BaseLineGraph.prototype.closeGraph = function () {
        if (this.points.length >= 3) {
            var point = this.points[0];
            this.points.push(point);
            this.lineMesh = BABYLON.Mesh.CreateLines(this.name, this.points, this.scene, true);
        }
    };
    BaseLineGraph.prototype.getVertices = function () {
        return this.points;
    };
    BaseLineGraph.prototype.updateGraphPoint = function (pointIndex, newPosition) {
    };
    BaseLineGraph.prototype.save = function () { return ""; };
    BaseLineGraph.prototype.load = function (json) { };
    BaseLineGraph.prototype.loadVectorData = function (vectorData) { };
    return BaseLineGraph;
}());
var BaseCurveGraph = (function () {
    function BaseCurveGraph(name, points, scene, graphIndex, discColor) {
        if (graphIndex === void 0) { graphIndex = 0; }
        if (discColor === void 0) { discColor = BABYLON.Color3.Red(); }
        this.graphIndex = graphIndex;
        this.scene = scene;
        this.points = [];
        this.discs = [];
        this.discColor = discColor;
        for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
            var p = points_2[_i];
            var point = new BABYLON.Vector3(p.x, p.y, 0);
            this.points.push(point);
            var disc = BABYLON.Mesh.CreateDisc("disc", 20, 20, this.scene);
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
    BaseCurveGraph.prototype.cubicBezier = function (v0, v1, v2, v3, nb) {
        var bez = [];
        var step = 1 / nb;
        var equation = function (t, val0, val1, val2, val3) {
            var res = (1 - t) * (1 - t) * (1 - t) * val0 + 3 * t * (1 - t) * (1 - t) * val1 + 3 * t * t * (1 - t) * val2 + t * t * t * val3;
            return res;
        };
        for (var i = 0; i <= 1; i += step) {
            bez.push(new BABYLON.Vector3(equation(i, v0.x, v1.x, v2.x, v3.x), equation(i, v0.y, v1.y, v2.y, v3.y), equation(i, v0.z, v1.z, v2.z, v3.z)));
        }
        bez.push(v3);
        return bez;
    };
    BaseCurveGraph.prototype.initCurves = function () {
        var pointsCount = this.points.length;
        if (pointsCount < 4) {
            return;
        }
        var cubicGroupCount = Math.floor((pointsCount + 1) / 4);
        console.log("cubicGroupCount", cubicGroupCount);
        for (var index = 0; index < cubicGroupCount; index++) {
            var curIndex = index;
            var curvePoints = this.cubicBezier(this.points[index * 3 + 0], this.points[index * 3 + 1], this.points[index * 3 + 2], this.points[index * 3 + 3], 50);
            // curIndex++;
            // if (curIndex < this.points.length){
            //     curvePoints.push(this.points[curIndex]);
            //     curIndex++;
            //     if (curIndex < this.points.length){
            //         curvePoints.push(this.points[curIndex]);
            //     }
            // }
            console.log(curvePoints);
            this.curves[index / 4] = BABYLON.Mesh.CreateLines("name", curvePoints, this.scene, true);
        }
    };
    BaseCurveGraph.prototype.pointAddedUpdateSpline = function () {
        this.updateSpline(this.discs.length - 1);
    };
    BaseCurveGraph.prototype.addPoint = function (point) {
        this.points.push(point);
        var disc = BABYLON.Mesh.CreateDisc("disc", 20, 20, this.scene);
        // let elevatedPoint = BABYLON
        disc.translate(point, 1);
        var material = new BABYLON.StandardMaterial("material01", scene);
        material.emissiveColor = this.discColor;
        disc.material = material;
        this.discs.push(disc);
        console.log("BaseCurveGraph::addPoint ", this.discs.length);
        this.discs[this.discs.length - 1].index = this.discs.length - 1;
        this.discs[this.discs.length - 1].curveIndex = this.graphIndex;
        this.pointAddedUpdateSpline();
    };
    BaseCurveGraph.prototype.updateCubicGroup = function (cubicGroup) {
        var curvePoints1 = this.cubicBezier(this.points[cubicGroup * 3 + 0], this.points[cubicGroup * 3 + 1], this.points[cubicGroup * 3 + 2], this.points[cubicGroup * 3 + 3], 50);
        this.curves[cubicGroup] = BABYLON.Mesh.CreateLines("name", curvePoints1, this.scene, true, this.curves[cubicGroup]);
    };
    BaseCurveGraph.prototype.updateSpline = function (pointIndex) {
        if (this.points.length < 4) {
            return;
        }
        var rem = pointIndex % 3;
        if (rem == 0 && pointIndex > 0) {
            var cubicGroup1 = Math.floor(pointIndex / 3);
            var cubicGroup2 = cubicGroup1 - 1;
            if (pointIndex + 3 < this.points.length) {
                var curvePoints1 = this.cubicBezier(this.points[cubicGroup1 * 3 + 0], this.points[cubicGroup1 * 3 + 1], this.points[cubicGroup1 * 3 + 2], this.points[cubicGroup1 * 3 + 3], 50);
                this.curves[cubicGroup1] = BABYLON.Mesh.CreateLines("name", curvePoints1, this.scene, true, this.curves[cubicGroup1]);
            }
            var curvePoints2 = this.cubicBezier(this.points[cubicGroup2 * 3 + 0], this.points[cubicGroup2 * 3 + 1], this.points[cubicGroup2 * 3 + 2], this.points[cubicGroup2 * 3 + 3], 50);
            this.curves[cubicGroup2] = BABYLON.Mesh.CreateLines("name", curvePoints2, this.scene, true, this.curves[cubicGroup2]);
        }
        else {
            var cubicGroup = Math.floor(pointIndex / 3);
            if ((cubicGroup + 1) * 3 < this.points.length) {
                this.updateCubicGroup(cubicGroup);
            }
        }
    };
    BaseCurveGraph.prototype.updateGraphPoint = function (pointIndex, newPosition) {
        this.points[pointIndex] = newPosition;
        this.discs[pointIndex].position = newPosition, 1;
        this.updateSpline(pointIndex);
    };
    BaseCurveGraph.prototype.closeGraph = function () {
    };
    BaseCurveGraph.prototype.getVertices = function () {
        return this.points;
    };
    BaseCurveGraph.prototype.clear = function () {
        this.points = [];
        while (this.curves.length > 0) {
            var curve = this.curves.pop();
            curve.dispose();
        }
        while (this.discs.length > 0) {
            var disc = this.discs.pop();
            disc.dispose();
        }
    };
    BaseCurveGraph.prototype.save = function () { return JSON.stringify(this.points); };
    BaseCurveGraph.prototype.load = function (json) {
        var tempAny = JSON.parse(json);
        console.log(tempAny);
        this.clear();
        for (var _i = 0, tempAny_1 = tempAny; _i < tempAny_1.length; _i++) {
            var point = tempAny_1[_i];
            var tempPoint = new BABYLON.Vector3(0, 0, 0);
            tempPoint.copyFrom(point);
            this.addPoint(tempPoint);
        }
    };
    BaseCurveGraph.prototype.loadVectorData = function (vectorData) {
        this.clear();
        for (var _i = 0, vectorData_1 = vectorData; _i < vectorData_1.length; _i++) {
            var point = vectorData_1[_i];
            var tempPoint = new BABYLON.Vector3(0, 0, 0);
            tempPoint.copyFrom(point);
            this.addPoint(tempPoint);
        }
    };
    return BaseCurveGraph;
}());
var SimpleCurveGraph = (function (_super) {
    __extends(SimpleCurveGraph, _super);
    function SimpleCurveGraph() {
        _super.apply(this, arguments);
    }
    return SimpleCurveGraph;
}(BaseCurveGraph));
var SimplePath = (function (_super) {
    __extends(SimplePath, _super);
    function SimplePath() {
        _super.apply(this, arguments);
        this.closeEnough = 1;
    }
    SimplePath.prototype.switchVertexIndex = function () {
        var vertices = this.getVertices();
        if (this.currentVertexIndex == vertices.length - 1) {
            this.currentVertexIndex = 0;
        }
        else {
            this.currentVertexIndex++;
        }
        if (this.nextVertexIndex == vertices.length - 1) {
            this.nextVertexIndex = 0;
        }
        else {
            this.nextVertexIndex++;
        }
    };
    SimplePath.prototype.SetMovable = function (movable) {
        this.movable = movable;
    };
    SimplePath.prototype.StartMoving = function () {
        if (!this.isActive) {
            this.currentVertexIndex = 0;
            this.nextVertexIndex = 1;
            this.isActive = true;
        }
    };
    SimplePath.prototype.StopMoving = function () {
        if (this.isActive) {
            this.isActive = false;
            this.movable = null;
        }
    };
    SimplePath.prototype.Tick = function (deltaTime) {
        if (this.isActive) {
            var currentVertex = this.getVertices()[this.currentVertexIndex];
            var nextVertex = this.getVertices()[this.nextVertexIndex];
            var movablePosition = this.movable.getAbsoluteLocation();
            var movableToNext = nextVertex.subtract(movablePosition);
            var movableToNextLength = movableToNext.length();
            if (movableToNextLength < this.closeEnough) {
                this.movable.setLocation(nextVertex);
                this.switchVertexIndex();
            }
            else {
                var movableToNextUnit = movableToNext.normalize();
                //console.log("movableToNextUnit " + movableToNextUnit.toString());
                this.movable.move(movableToNextUnit, deltaTime);
                this.movable.turn(deltaTime);
            }
        }
    };
    return SimplePath;
}(BaseLineGraph));
/// <reference path="./graph.ts"/>
var BaseInteractiveGraphPlane = (function () {
    function BaseInteractiveGraphPlane() {
        this.isActive = true;
    }
    BaseInteractiveGraphPlane.prototype.addPoint = function (point) {
        if (this.isActive) {
            this.graph.addPoint(point);
        }
    };
    BaseInteractiveGraphPlane.prototype.finishDrawing = function () {
        if (this.isActive) {
            this.graph.closeGraph();
            this.isActive = false;
        }
    };
    BaseInteractiveGraphPlane.prototype.disableEditing = function () {
        this.isActive = false;
    };
    BaseInteractiveGraphPlane.prototype.enableEditing = function () {
        this.isActive = true;
    };
    return BaseInteractiveGraphPlane;
}());
var SimpleInteractiveGraphPlane = (function (_super) {
    __extends(SimpleInteractiveGraphPlane, _super);
    function SimpleInteractiveGraphPlane(name, width, height, scene, graph) {
        _super.call(this);
        this.plane = BABYLON.Mesh.CreateGround(name, width, height, 2, scene);
        this.plane.translate(new BABYLON.Vector3(1, 0, 0), 0);
        this.plane.rotate(new BABYLON.Vector3(1, 0, 0), -Math.PI / 2);
        if (graph) {
            this.graph = graph;
        }
    }
    SimpleInteractiveGraphPlane.prototype.onPointerDown = function (evt, pickingInfo) {
        //console.log("onPointerDown", evt);
        console.log("onPointerDown", pickingInfo.pickedMesh.name, pickingInfo);
        if (pickingInfo.hit) {
            if (pickingInfo.pickedMesh == this.plane && evt.button == 0) {
                this.addPoint(pickingInfo.pickedPoint);
            }
        }
    };
    return SimpleInteractiveGraphPlane;
}(BaseInteractiveGraphPlane));
var SimpleCurvePlane = (function (_super) {
    __extends(SimpleCurvePlane, _super);
    function SimpleCurvePlane(name, width, height, scene, graph) {
        _super.call(this, name, width, height, scene, graph);
        this.graph = new SimpleCurveGraph(name, [], scene);
        this.rmbPressed = false;
    }
    SimpleCurvePlane.prototype.onPointerMove = function (evt, pickingInfo) {
        var _this = this;
        if (this.rmbPressed) {
            if (this.graph) {
                var newPosition = null;
                var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh.name == _this.plane.name; });
                if (pickinfo.hit) {
                    newPosition = pickinfo.pickedPoint;
                }
                if (newPosition) {
                    console.log("onPointerMove", newPosition, this.currentPointIndex);
                    this.graph.updateGraphPoint(this.currentPointIndex, newPosition);
                }
            }
        }
    };
    SimpleCurvePlane.prototype.onPointerUp = function (evt, pickingInfo) {
        this.rmbPressed = false;
    };
    SimpleCurvePlane.prototype.onPointerDown = function (evt, pickingInfo) {
        //super.onPointerDown(evt, pickingInfo);
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh.name == "disc"; });
        if (pickinfo.hit) {
            var indexMesh = pickingInfo.pickedMesh;
            console.log(pickinfo.pickedMesh.index);
            this.currentPointIndex = pickinfo.pickedMesh.index;
            this.rmbPressed = true;
            console.log("onPointerDown", this.currentPointIndex);
        }
        else {
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== this.plane; });
            if (pickinfo.hit) {
                this.addPoint(pickingInfo.pickedPoint);
            }
        }
    };
    SimpleCurvePlane.prototype.saveJsonData = function () {
        return this.graph.save();
    };
    SimpleCurvePlane.prototype.loadJsonData = function (json) {
        this.graph.load(json);
    };
    SimpleCurvePlane.prototype.loadVectorData = function (vectorData) {
        this.graph.loadVectorData(vectorData);
    };
    return SimpleCurvePlane;
}(SimpleInteractiveGraphPlane));
var LongSimpleCurvePlane = (function (_super) {
    __extends(LongSimpleCurvePlane, _super);
    function LongSimpleCurvePlane(name, width, height, scene, graph) {
        _super.call(this, name, 1300, 600, scene, graph);
    }
    return LongSimpleCurvePlane;
}(SimpleCurvePlane));
var ComplexCurvePlane = (function (_super) {
    __extends(ComplexCurvePlane, _super);
    function ComplexCurvePlane(name, width, height, scene, graph) {
        _super.call(this, name, 1300, 600, scene, graph);
        this.curveArray = new Array();
        this.lmbPressed = false;
    }
    ComplexCurvePlane.prototype.onPointerMove = function (evt, pickingInfo) {
        var _this = this;
        if (this.lmbPressed) {
            var newPosition = null;
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh.name == _this.plane.name; });
            if (pickinfo.hit) {
                newPosition = pickinfo.pickedPoint;
            }
            if (newPosition) {
                if (this.curveArray[this.currentCurveIndex]) {
                    this.curveArray[this.currentCurveIndex].updateGraphPoint(this.currentPointIndex, newPosition);
                }
            }
        }
    };
    ComplexCurvePlane.prototype.onPointerUp = function (evt, pickingInfo) {
        this.lmbPressed = false;
    };
    ComplexCurvePlane.prototype.onPointerDown = function (evt, pickingInfo) {
        //super.onPointerDown(evt, pickingInfo);
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh.name == "disc"; });
        if (pickinfo.hit) {
            console.log(pickinfo.pickedMesh.index);
            this.currentPointIndex = pickinfo.pickedMesh.index;
            this.currentCurveIndex = pickinfo.pickedMesh.curveIndex;
            this.lmbPressed = true;
            console.log("onPointerDown", this.currentPointIndex);
        }
        else {
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== this.plane; });
            if (pickinfo.hit) {
                this.addPoint(pickingInfo.pickedPoint);
            }
        }
    };
    ComplexCurvePlane.prototype.saveJsonData = function () {
        return this.graph.save();
    };
    ComplexCurvePlane.prototype.loadJsonData = function (json) {
        this.graph.load(json);
    };
    ComplexCurvePlane.prototype.loadVectorData = function (vectorData) {
        this.graph.loadVectorData(vectorData);
    };
    ComplexCurvePlane.prototype.loadComplexVectorData = function (complexVectorData) {
        for (var index = 0; index < complexVectorData.length; index++) {
            this.curveArray[index] = new SimpleCurveGraph(name, [], scene, index);
            this.curveArray[index].loadVectorData(complexVectorData[index]);
        }
    };
    return ComplexCurvePlane;
}(SimpleInteractiveGraphPlane));
var SimplePathPlane = (function (_super) {
    __extends(SimplePathPlane, _super);
    function SimplePathPlane(name, width, height, scene, graph) {
        _super.call(this, name, width, height, scene);
        this.pathGraph = new SimplePath("lines", [], scene);
        this.graph = this.pathGraph;
    }
    SimplePathPlane.prototype.startMoving = function (movable) {
        this.pathGraph.SetMovable(movable);
        this.pathGraph.StartMoving();
    };
    SimplePathPlane.prototype.update = function (deltaTime) {
        this.pathGraph.Tick(deltaTime);
    };
    return SimplePathPlane;
}(SimpleInteractiveGraphPlane));
var SimpleMovablePlane = (function (_super) {
    __extends(SimpleMovablePlane, _super);
    function SimpleMovablePlane(name, width, height, scene, graph) {
        _super.call(this, name, width, height, scene);
        this.graph = new SimplePath("lines", [], scene);
    }
    SimpleMovablePlane.prototype.buildMovable = function (name, scene) {
        var points = this.graph.getVertices();
        var points2D = [];
        for (var _i = 0, points_3 = points; _i < points_3.length; _i++) {
            var point = points_3[_i];
            points2D.push(new BABYLON.Vector2(point.x, point.y));
        }
        console.log("before" + points2D);
        return new LinAlgMovable(name, points2D, scene);
    };
    return SimpleMovablePlane;
}(SimpleInteractiveGraphPlane));
/// <reference path="./drawingPlane.ts"/>
var LineEditor = (function () {
    function LineEditor(name, scene) {
        this.scene = scene;
        this.name = name;
        this.simplePath = new SimplePathPlane("plane", 0, 0, scene);
        this.simpleMovableGraph = new SimpleMovablePlane("plane", 500, 0, scene);
    }
    LineEditor.prototype.finishEditingMovable = function () {
        this.finishedEditingMovable = true;
        this.simpleMovableGraph.finishDrawing();
        this.tryStartMoving();
    };
    LineEditor.prototype.finishEditingPath = function () {
        this.finishedEditingPath = true;
        this.simplePath.finishDrawing();
        this.tryStartMoving();
    };
    LineEditor.prototype.tryStartMoving = function () {
        if (this.finishedEditingMovable && this.finishedEditingPath) {
            var points = this.simpleMovableGraph.graph.getVertices();
            var points2D = [];
            for (var _i = 0, points_4 = points; _i < points_4.length; _i++) {
                var point = points_4[_i];
                points2D.push(new BABYLON.Vector2(point.x, point.y));
            }
            console.log("before" + points2D);
            var movable = new LinAlgMovable("movable222", points2D, this.scene);
            console.log("after");
            console.log(movable);
            this.simplePath.startMoving(movable);
        }
    };
    LineEditor.prototype.onPointerEvent = function (evt, pickingInfo) {
        this.simpleMovableGraph.onPointerDown(evt, pickingInfo);
        this.simplePath.onPointerDown(evt, pickingInfo);
    };
    LineEditor.prototype.Tick = function (deltaTime) {
        this.simplePath.update(deltaTime);
    };
    return LineEditor;
}());
var CurveEditor = (function () {
    function CurveEditor(name, scene) {
        this.scene = scene;
        this.name = name;
        this.curvePlane = new LongSimpleCurvePlane("plane", 0, 0, scene);
    }
    CurveEditor.prototype.onPointerDown = function (evt, pickingInfo) {
        this.curvePlane.onPointerDown(evt, pickingInfo);
    };
    CurveEditor.prototype.onPointerUp = function (evt, pickingInfo) {
        this.curvePlane.onPointerUp(evt, pickingInfo);
    };
    CurveEditor.prototype.onPointerMove = function (evt, pickingInfo) {
        this.curvePlane.onPointerMove(evt, pickingInfo);
    };
    CurveEditor.prototype.saveJsonData = function () {
        return this.curvePlane.saveJsonData();
    };
    CurveEditor.prototype.loadJsonData = function (json) {
        this.curvePlane.loadJsonData(json);
    };
    CurveEditor.prototype.loadVectorData = function (vectorData) {
        this.curvePlane.loadVectorData(vectorData);
    };
    return CurveEditor;
}());
var NameEditor = (function () {
    function NameEditor(name, scene) {
        this.scene = scene;
        this.name = name;
        this.curvePlane = new ComplexCurvePlane("plane", 0, 0, scene);
    }
    NameEditor.prototype.onPointerDown = function (evt, pickingInfo) {
        this.curvePlane.onPointerDown(evt, pickingInfo);
    };
    NameEditor.prototype.onPointerUp = function (evt, pickingInfo) {
        this.curvePlane.onPointerUp(evt, pickingInfo);
    };
    NameEditor.prototype.onPointerMove = function (evt, pickingInfo) {
        this.curvePlane.onPointerMove(evt, pickingInfo);
    };
    NameEditor.prototype.saveJsonData = function () {
        return this.curvePlane.saveJsonData();
    };
    NameEditor.prototype.loadJsonData = function (json) {
        this.curvePlane.loadJsonData(json);
    };
    NameEditor.prototype.loadVectorData = function (vectorData) {
        this.curvePlane.loadVectorData(vectorData);
    };
    NameEditor.prototype.loadComplexVectorData = function (complexVectorData) {
        this.curvePlane.loadComplexVectorData(complexVectorData);
    };
    return NameEditor;
}());
var ilyinName = [
    {
        "x": -516.9999671300253,
        "y": 182.5,
        "z": 3.552713678800501e-14
    },
    {
        "x": -594.9999621709188,
        "y": 19.500000000000007,
        "z": 3.552713678800501e-15
    },
    {
        "x": -551.9999649047851,
        "y": -71.5,
        "z": -2.1316282072803006e-14
    },
    {
        "x": -449.9999713897705,
        "y": -84.49999999999999,
        "z": -2.1316282072803006e-14
    },
    {
        "x": -367.9999766031901,
        "y": -93.5,
        "z": -2.4868995751603507e-14
    },
    {
        "x": -292.99998137156166,
        "y": 100.50000000000001,
        "z": 2.1316282072803006e-14
    },
    {
        "x": -329.99997901916504,
        "y": 194.5,
        "z": 4.263256414560601e-14
    },
    {
        "x": -247.9999842325846,
        "y": -146.49999999999997,
        "z": -3.197442310920451e-14
    },
    {
        "x": -400.99997450510665,
        "y": -136.49999999999997,
        "z": -3.552713678800501e-14
    },
    {
        "x": -186.99998811086022,
        "y": -26.500000000000018,
        "z": -7.105427357601002e-15
    },
    {
        "x": -173.99998893737796,
        "y": -105.50000000000001,
        "z": -2.4868995751603507e-14
    },
    {
        "x": -103.99999338785803,
        "y": -54.49999999999999,
        "z": -1.4210854715202004e-14
    },
    {
        "x": -122.99999217987065,
        "y": 116.50000000000001,
        "z": 2.1316282072803006e-14
    },
    {
        "x": -92.99999408721928,
        "y": -116.49999999999999,
        "z": -2.4868995751603507e-14
    },
    {
        "x": -51.99999669392906,
        "y": -78.50000000000001,
        "z": -2.1316282072803006e-14
    },
    {
        "x": -26.999998283386187,
        "y": 66.5,
        "z": 1.4210854715202004e-14
    },
    {
        "x": -38.9999975204468,
        "y": -82.49999999999997,
        "z": -2.1316282072803006e-14
    },
    {
        "x": 14.999999046325684,
        "y": -91.49999999999999,
        "z": -2.4868995751603507e-14
    },
    {
        "x": 46.999997011820575,
        "y": -20.49999999999998,
        "z": -7.105427357601002e-15
    },
    {
        "x": 69.99999554951992,
        "y": 42.499999999999986,
        "z": 7.105427357601002e-15
    },
    {
        "x": -29.999998092651367,
        "y": -11.500000000000023,
        "z": -7.105427357601002e-15
    },
    {
        "x": -27.99999821980795,
        "y": -25.499999999999975,
        "z": -7.105427357601002e-15
    },
    {
        "x": 87.99999440511058,
        "y": 21.499999999999986,
        "z": 3.552713678800501e-15
    },
    {
        "x": 111.9999928792318,
        "y": 28.499999999999996,
        "z": 3.552713678800501e-15
    },
    {
        "x": 121.99999224344899,
        "y": 84.50000000000001,
        "z": 1.7763568394002505e-14
    },
    {
        "x": 94.9999939600626,
        "y": -52.49999999999998,
        "z": -1.0658141036401503e-14
    },
    {
        "x": 166.99998938242604,
        "y": -96.49999999999999,
        "z": -2.4868995751603507e-14
    },
    {
        "x": 213.9999863942464,
        "y": -20.49999999999998,
        "z": -7.105427357601002e-15
    },
    {
        "x": 227.99998550415043,
        "y": 32.499999999999986,
        "z": 3.552713678800501e-15
    },
    {
        "x": 229.99998537699375,
        "y": 64.49999999999999,
        "z": 1.7763568394002505e-14
    },
    {
        "x": 226.99998556772877,
        "y": 89.50000000000001,
        "z": 2.1316282072803006e-14
    },
    {
        "x": 244.99998442331943,
        "y": -5.499999999999984,
        "z": 0
    },
    {
        "x": 229.99998537699375,
        "y": -49.49999999999999,
        "z": -1.4210854715202004e-14
    },
    {
        "x": 285.99998181660965,
        "y": -35.49999999999997,
        "z": -7.105427357601002e-15
    },
    {
        "x": 325.99997927347823,
        "y": -0.4999999999999858,
        "z": 0
    },
    {
        "x": 349.9999777475992,
        "y": 45.5,
        "z": 7.105427357601002e-15
    },
    {
        "x": 367.9999766031901,
        "y": 121.50000000000001,
        "z": 2.842170943040401e-14
    },
    {
        "x": 377.9999759674073,
        "y": 32.499999999999986,
        "z": 3.552713678800501e-15
    },
    {
        "x": 398.9999746322631,
        "y": -5.499999999999984,
        "z": 0
    },
    {
        "x": 388.9999752680461,
        "y": -49.49999999999999,
        "z": -1.4210854715202004e-14
    },
    {
        "x": 385.99997545878097,
        "y": 84.50000000000001,
        "z": 1.7763568394002505e-14
    },
    {
        "x": 464.9999704360962,
        "y": 15.500000000000014,
        "z": 3.552713678800501e-15
    },
    {
        "x": 436.99997221628837,
        "y": 131.5,
        "z": 2.842170943040401e-14
    },
    {
        "x": 457.9999708811442,
        "y": 50.5,
        "z": 7.105427357601002e-15
    },
    {
        "x": 461.999970626831,
        "y": -94.49999999999997,
        "z": -2.4868995751603507e-14
    },
    {
        "x": 549.9999650319418,
        "y": 2.499999999999999,
        "z": 0
    }
];
var complexIlyinName = [[
        {
            "x": -516.9999671300253,
            "y": 182.5,
            "z": 3.552713678800501e-14
        },
        {
            "x": -594.9999621709188,
            "y": 19.500000000000007,
            "z": 3.552713678800501e-15
        },
        {
            "x": -551.9999649047851,
            "y": -71.5,
            "z": -2.1316282072803006e-14
        },
        {
            "x": -449.9999713897705,
            "y": -84.49999999999999,
            "z": -2.1316282072803006e-14
        },
        {
            "x": -367.9999766031901,
            "y": -93.5,
            "z": -2.4868995751603507e-14
        },
        {
            "x": -292.99998137156166,
            "y": 100.50000000000001,
            "z": 2.1316282072803006e-14
        },
        {
            "x": -329.99997901916504,
            "y": 194.5,
            "z": 4.263256414560601e-14
        },
        {
            "x": -247.9999842325846,
            "y": -146.49999999999997,
            "z": -3.197442310920451e-14
        },
        {
            "x": -400.99997450510665,
            "y": -136.49999999999997,
            "z": -3.552713678800501e-14
        },
        {
            "x": -186.99998811086022,
            "y": -26.500000000000018,
            "z": -7.105427357601002e-15
        }], [
        {
            "x": -186.99998811086022,
            "y": -26.500000000000018,
            "z": -7.105427357601002e-15
        },
        {
            "x": -173.99998893737796,
            "y": -105.50000000000001,
            "z": -2.4868995751603507e-14
        },
        {
            "x": -103.99999338785803,
            "y": -54.49999999999999,
            "z": -1.4210854715202004e-14
        },
        {
            "x": -122.99999217987065,
            "y": 116.50000000000001,
            "z": 2.1316282072803006e-14
        },
        {
            "x": -92.99999408721928,
            "y": -116.49999999999999,
            "z": -2.4868995751603507e-14
        },
        {
            "x": -51.99999669392906,
            "y": -78.50000000000001,
            "z": -2.1316282072803006e-14
        },
        {
            "x": -26.999998283386187,
            "y": 66.5,
            "z": 1.4210854715202004e-14
        }], [
        {
            "x": -26.999998283386187,
            "y": 66.5,
            "z": 1.4210854715202004e-14
        },
        {
            "x": -38.9999975204468,
            "y": -82.49999999999997,
            "z": -2.1316282072803006e-14
        },
        {
            "x": 14.999999046325684,
            "y": -91.49999999999999,
            "z": -2.4868995751603507e-14
        },
        {
            "x": 46.999997011820575,
            "y": -20.49999999999998,
            "z": -7.105427357601002e-15
        },
        {
            "x": 69.99999554951992,
            "y": 42.499999999999986,
            "z": 7.105427357601002e-15
        },
        {
            "x": -29.999998092651367,
            "y": -11.500000000000023,
            "z": -7.105427357601002e-15
        },
        {
            "x": -27.99999821980795,
            "y": -25.499999999999975,
            "z": -7.105427357601002e-15
        },
        {
            "x": 87.99999440511058,
            "y": 21.499999999999986,
            "z": 3.552713678800501e-15
        },
        {
            "x": 111.9999928792318,
            "y": 28.499999999999996,
            "z": 3.552713678800501e-15
        },
        {
            "x": 121.99999224344899,
            "y": 84.50000000000001,
            "z": 1.7763568394002505e-14
        }], [
        {
            "x": 121.99999224344899,
            "y": 84.50000000000001,
            "z": 1.7763568394002505e-14
        },
        {
            "x": 94.9999939600626,
            "y": -52.49999999999998,
            "z": -1.0658141036401503e-14
        },
        {
            "x": 166.99998938242604,
            "y": -96.49999999999999,
            "z": -2.4868995751603507e-14
        },
        {
            "x": 213.9999863942464,
            "y": -20.49999999999998,
            "z": -7.105427357601002e-15
        },
        {
            "x": 227.99998550415043,
            "y": 32.499999999999986,
            "z": 3.552713678800501e-15
        },
        {
            "x": 229.99998537699375,
            "y": 64.49999999999999,
            "z": 1.7763568394002505e-14
        },
        {
            "x": 226.99998556772877,
            "y": 89.50000000000001,
            "z": 2.1316282072803006e-14
        },
        {
            "x": 244.99998442331943,
            "y": -5.499999999999984,
            "z": 0
        },
        {
            "x": 229.99998537699375,
            "y": -49.49999999999999,
            "z": -1.4210854715202004e-14
        },
        {
            "x": 285.99998181660965,
            "y": -35.49999999999997,
            "z": -7.105427357601002e-15
        }
    ], [
        {
            "x": 367.9999766031901,
            "y": 121.50000000000001,
            "z": 2.842170943040401e-14
        },
        {
            "x": 377.9999759674073,
            "y": 32.499999999999986,
            "z": 3.552713678800501e-15
        },
        {
            "x": 398.9999746322631,
            "y": -5.499999999999984,
            "z": 0
        },
        {
            "x": 388.9999752680461,
            "y": -49.49999999999999,
            "z": -1.4210854715202004e-14
        },
        {
            "x": 385.99997545878097,
            "y": 84.50000000000001,
            "z": 1.7763568394002505e-14
        },
        {
            "x": 464.9999704360962,
            "y": 15.500000000000014,
            "z": 3.552713678800501e-15
        },
        {
            "x": 436.99997221628837,
            "y": 131.5,
            "z": 2.842170943040401e-14
        },
        {
            "x": 457.9999708811442,
            "y": 50.5,
            "z": 7.105427357601002e-15
        },
        {
            "x": 461.999970626831,
            "y": -94.49999999999997,
            "z": -2.4868995751603507e-14
        },
        {
            "x": 549.9999650319418,
            "y": 2.499999999999999,
            "z": 0
        }
    ]];
/// <reference path="../common/graph.ts"/>
/// <reference path="../common/drawingPlane.ts"/>
/// <reference path="../common/editor.ts"/>
var PolygonGraph = (function (_super) {
    __extends(PolygonGraph, _super);
    function PolygonGraph(name, points, scene, graphIndex) {
        if (graphIndex === void 0) { graphIndex = 0; }
        _super.call(this, name, points, scene, graphIndex);
        this.closed = false;
    }
    PolygonGraph.prototype.initCurves = function () {
        if (this.points.length < 3) {
            return;
        }
        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);
    };
    PolygonGraph.prototype.pointAddedUpdateSpline = function () {
        if (this.points.length < 3) {
            return;
        }
        if (this.curves[0]) {
            this.curves[0].dispose();
        }
        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);
    };
    PolygonGraph.prototype.updateSpline = function (pointIndex) {
        if (this.points.length < 3) {
            return;
        }
        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true, this.curves[0]);
    };
    PolygonGraph.prototype.cross = function (A, B, C) {
        return (B.x - A.x) * (C.y - B.y) - (B.y - A.y) * (C.x - B.x);
    };
    PolygonGraph.prototype.getVertices = function () {
        var A = this.points[0];
        var B = this.points[1];
        var clockwise = false;
        for (var i = 2; i < this.points.length - 1; i++) {
            var C = this.points[i];
            var z = this.cross(A, B, C);
            if (z != 0) {
                clockwise = z > 0;
                break;
            }
        }
        var newPoints = [];
        console.log(this.points);
        if (clockwise) {
            for (var i = 0; i < this.points.length - 1; i++) {
                newPoints.push(this.points[i]);
            }
        }
        else {
            for (var i = this.points.length - 2; i >= 0; i--) {
                newPoints.push(this.points[i]);
            }
        }
        return newPoints;
    };
    PolygonGraph.prototype.updateGraphPoint = function (pointIndex, newPosition) {
        if (pointIndex == 0 && this.closed) {
            this.points[pointIndex] = newPosition;
            this.points[this.points.length - 1] = newPosition;
        }
        else {
            this.points[pointIndex] = newPosition;
        }
        this.discs[pointIndex].position = newPosition, 1;
        this.updateSpline(pointIndex);
    };
    PolygonGraph.prototype.closeGraph = function () {
        if (this.points.length >= 3) {
            this.closed = true;
            var point = this.points[0];
            this.points.push(point);
            this.curves[0].dispose();
            this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);
        }
    };
    return PolygonGraph;
}(BaseCurveGraph));
var SinglePointGraph = (function (_super) {
    __extends(SinglePointGraph, _super);
    function SinglePointGraph(name, points, scene, graphIndex) {
        if (graphIndex === void 0) { graphIndex = 0; }
        _super.call(this, name, points, scene, graphIndex, BABYLON.Color3.Green());
    }
    SinglePointGraph.prototype.initCurves = function () {
        if (this.points.length > 1) {
            return;
        }
        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);
    };
    SinglePointGraph.prototype.pointAddedUpdateSpline = function () {
        if (this.points.length > 1) {
            return;
        }
        this.curves[0] = BABYLON.Mesh.CreateLines("name", this.points, this.scene, true);
    };
    SinglePointGraph.prototype.getVertices = function () {
        return this.points;
    };
    return SinglePointGraph;
}(BaseCurveGraph));
var PolygonPlane = (function (_super) {
    __extends(PolygonPlane, _super);
    function PolygonPlane(name, width, height, scene, graph) {
        _super.call(this, name, 1300, 600, scene, graph);
        this.graph = new PolygonGraph("Polygon", [], scene, 0);
        this.drawingPolygon = true;
        this.singlePointGraph = new SinglePointGraph("Single Point", [], scene, 1);
        this.lmbPressed = false;
    }
    PolygonPlane.prototype.finishDrawing = function () {
        this.drawingPolygon = false;
        this.graph.closeGraph();
    };
    PolygonPlane.prototype.onPointerMove = function (evt, pickingInfo) {
        var _this = this;
        if (this.lmbPressed) {
            var newPosition = null;
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh.name == _this.plane.name; });
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
    };
    PolygonPlane.prototype.onPointerUp = function (evt, pickingInfo) {
        this.lmbPressed = false;
    };
    PolygonPlane.prototype.onPointerDown = function (evt, pickingInfo) {
        //super.onPointerDown(evt, pickingInfo);
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh.name == "disc"; });
        if (pickinfo.hit) {
            console.log(pickinfo.pickedMesh.index);
            this.currentPointIndex = pickinfo.pickedMesh.index;
            this.currentCurveIndex = pickinfo.pickedMesh.curveIndex;
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
    };
    PolygonPlane.prototype.cross = function (A, B, C) {
        return (B.x - A.x) * (C.y - B.y) - (B.y - A.y) * (C.x - B.x);
    };
    PolygonPlane.prototype.intersect = function (A, B, C, D) {
        return this.cross(A, B, C) * this.cross(A, B, D) <= 0 && this.cross(C, D, A) * this.cross(C, D, B) < 0;
    };
    PolygonPlane.prototype.pointloc = function (P, A) {
        var n = P.length;
        if (this.cross(P[0], P[1], A) < 0 || this.cross(P[0], P[n - 1], A) > 0) {
            return false;
        }
        var p = 1;
        var r = n - 1;
        while (r - p > 1) {
            var q = Math.floor((p + r) / 2);
            console.log(this.cross(P[0], P[q], A), q, P[q], A);
            if (this.cross(P[0], P[q], A) < 0) {
                r = q;
            }
            else {
                p = q;
            }
        }
        return !(this.intersect(P[0], A, P[p], P[r]));
    };
    PolygonPlane.prototype.isPointInsidePolygon = function () {
        var polygonPoints = this.graph.getVertices();
        var testPoint = this.singlePointGraph.getVertices()[0];
        if (polygonPoints == undefined) {
            return false;
        }
        if (testPoint == undefined) {
            return false;
        }
        var res = this.pointloc(polygonPoints, testPoint);
        console.log(polygonPoints, testPoint, res);
        return res;
    };
    return PolygonPlane;
}(SimpleCurvePlane));
var PolygonEditor = (function () {
    function PolygonEditor(name, scene) {
        this.scene = scene;
        this.name = name;
        this.curvePlane = new PolygonPlane("plane", 0, 0, scene);
    }
    PolygonEditor.prototype.onPointerDown = function (evt, pickingInfo) {
        this.curvePlane.onPointerDown(evt, pickingInfo);
    };
    PolygonEditor.prototype.onPointerUp = function (evt, pickingInfo) {
        this.curvePlane.onPointerUp(evt, pickingInfo);
    };
    PolygonEditor.prototype.onPointerMove = function (evt, pickingInfo) {
        this.curvePlane.onPointerMove(evt, pickingInfo);
    };
    PolygonEditor.prototype.saveJsonData = function () {
        return this.curvePlane.saveJsonData();
    };
    PolygonEditor.prototype.loadJsonData = function (json) {
        this.curvePlane.loadJsonData(json);
    };
    PolygonEditor.prototype.loadVectorData = function (vectorData) {
        this.curvePlane.loadVectorData(vectorData);
    };
    PolygonEditor.prototype.closeGraph = function () {
        this.curvePlane.finishDrawing();
    };
    PolygonEditor.prototype.isPointInsidePolygon = function () {
        return this.curvePlane.isPointInsidePolygon();
    };
    return PolygonEditor;
}());
/// <reference path="../common/actor.ts"/>
/// <reference path="../common/graph.ts"/>
/// <reference path="../common/drawingPlane.ts"/>
/// <reference path="../common/editor.ts"/>
/// <reference path="../common/ilyin.ts"/>
/// <reference path="./editor.ts"/>
var canvas = (document.getElementById("renderCanvas"));
var engine = new BABYLON.Engine(canvas, true);
//потом занести это создание прямо в плоскость, в которой рисуют
var editor;
var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 10, 20), scene);
    var freeCamera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 0, -30), scene);
    freeCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    // let curveGraph: SimpleCurveGraph = new SimpleCurveGraph("new graph", [new BABYLON.Vector2(0,0),
    //  new BABYLON.Vector2(0,100),
    //   new BABYLON.Vector2(100,100),new BABYLON.Vector2(200,200)], scene)
    // curveGraph.addPoint(new BABYLON.Vector3(300,0, 0));
    // curveGraph.addPoint(new BABYLON.Vector3(300,50, 0));
    // curveGraph.addPoint(new BABYLON.Vector3(300,100, 0));
    editor = new PolygonEditor("editor", scene);
    scene.onPointerDown = function (evt, pickResult) {
        editor.onPointerDown(evt, pickResult);
    };
    scene.onPointerUp = function (evt, pickResult) {
        editor.onPointerUp(evt, pickResult);
    };
    scene.onPointerMove = function (evt, pickResult) {
        editor.onPointerMove(evt, pickResult);
    };
    return scene;
};
var scene = createScene();
engine.runRenderLoop(function () {
    scene.render();
    var deltaTime = engine.getDeltaTime();
    // editor.Tick(deltaTime);
});
window.addEventListener("resize", function () {
    engine.resize();
});
var changeColorButtonClick = function () {
    scene.clearColor = new BABYLON.Color3(1, 1, 0);
};
var closeGraph = function () {
    editor.closeGraph();
};
var finishGraph = function () {
    var res = editor.isPointInsidePolygon();
    var resultDiv = document.getElementById("result");
    if (res) {
        resultDiv.innerHTML = "<p class=\"rightResult\">Inside</p>";
    }
    else {
        resultDiv.innerHTML = "<p class=\"wrongResult\">Outside</p>";
    }
};
var huyButton = document.getElementById("huy");
huyButton.onclick = changeColorButtonClick;
var closeButton = document.getElementById("close");
closeButton.onclick = closeGraph;
var finishButton = document.getElementById("finish");
finishButton.onclick = finishGraph;