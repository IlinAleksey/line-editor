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
    function BaseLineMovable(name, points, scene) {
        _super.call(this);
        this.scene = scene;
        this.points = [];
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            this.points.push(new BABYLON.Vector3(p.x, p.y, 0));
        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.points, scene, true);
    }
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
    function LinAlgMovable() {
        _super.apply(this, arguments);
    }
    LinAlgMovable.prototype.rotateVectorAroundOrigin = function (vector, angle) {
        return new BABYLON.Vector3(vector.x * Math.cos(angle) - vector.y * Math.sin(angle), vector.y * Math.cos(angle) + vector.x * Math.sin(angle), 0);
    };
    LinAlgMovable.prototype.rotateAroundOrigin = function (vector, pivot, angle) {
        //console.log("rotateAroundOrigin " + vector + pivot + angle)
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
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var position = _a[_i];
            sum.addInPlace(position);
        }
        var average = sum.divide(new BABYLON.Vector3(this.points.length, this.points.length, 1));
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
        for (var index in this.points) {
            this.points[index].addInPlace(position);
        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.points, scene, true, this.lineMesh);
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
        for (var index in this.points) {
            this.points[index] = this.rotateAroundOrigin(this.points[index], pivot, radians);
        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.points, scene, true, this.lineMesh);
    };
    LinAlgMovable.prototype.getZRotation = function () {
        return this.rotation;
    };
    return LinAlgMovable;
}(BaseLineMovable));
var BaseLineGraph = (function () {
    function BaseLineGraph(name, points, scene) {
        this.scene = scene;
        this.points = [];
        for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
            var p = points_2[_i];
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
    return BaseLineGraph;
}());
var SimpleGraph = (function (_super) {
    __extends(SimpleGraph, _super);
    function SimpleGraph() {
        _super.apply(this, arguments);
    }
    return SimpleGraph;
}(BaseLineGraph));
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
    return BaseInteractiveGraphPlane;
}());
var SimpleInteractiveGraphPlane = (function (_super) {
    __extends(SimpleInteractiveGraphPlane, _super);
    function SimpleInteractiveGraphPlane(name, width, height, scene, graph) {
        _super.call(this);
        this.plane = BABYLON.Mesh.CreateGround(name, width, height, 2, scene);
        this.plane.rotate(new BABYLON.Vector3(1, 0, 0), -Math.PI / 2);
        if (graph) {
            this.graph = graph;
        }
    }
    SimpleInteractiveGraphPlane.prototype.onPointerEvent = function (evt, pickingInfo) {
        if (pickingInfo.hit) {
            if (pickingInfo.pickedMesh == this.plane) {
                this.addPoint(pickingInfo.pickedPoint);
            }
        }
    };
    return SimpleInteractiveGraphPlane;
}(BaseInteractiveGraphPlane));
/// <reference path="./actor.ts"/>
/// <reference path="./graph.ts"/>
/// <reference path="./drawingPlane.ts"/>
var canvas = (document.getElementById("renderCanvas"));
var engine = new BABYLON.Engine(canvas, true);
//потом занести это создание прямо в плоскость, в которой рисуют
var simplePath;
var plane;
var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    simplePath = new SimplePath("lines", [], scene);
    plane = new SimpleInteractiveGraphPlane("plane", 400, 400, scene, simplePath);
    var light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 10, 20), scene);
    var freeCamera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 0, -30), scene);
    freeCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    scene.onPointerDown = function (evt, pickResult) {
        plane.onPointerEvent(evt, pickResult);
    };
    return scene;
};
var scene = createScene();
engine.runRenderLoop(function () {
    scene.render();
    var deltaTime = engine.getDeltaTime();
    simplePath.Tick(deltaTime);
});
window.addEventListener("resize", function () {
    engine.resize();
});
var changeColorButtonClick = function () {
    scene.clearColor = new BABYLON.Color3(1, 1, 0);
};
var closeGraph = function () {
    plane.finishDrawing();
    //тестовая фигура
    var points = [
        new BABYLON.Vector2(20, 0),
        new BABYLON.Vector2(20, 20),
        new BABYLON.Vector2(0, 20),
        new BABYLON.Vector2(0, 0),
        new BABYLON.Vector2(20, 0)
    ];
    var simpleMovable = new LinAlgMovable("simple", points, scene);
    simpleMovable.angularSpeed = 0.1;
    simpleMovable.linearSpeed = 0.1;
    simplePath.SetMovable(simpleMovable);
    simplePath.StartMoving();
};
var huyButton = document.getElementById("huy");
huyButton.onclick = changeColorButtonClick;
var closeButton = document.getElementById("close");
closeButton.onclick = closeGraph;
