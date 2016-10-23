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
    return BaseLineGraph;
}());
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
        this.plane = BABYLON.Mesh.CreateGround(name, 400, 400, 2, scene);
        this.plane.translate(new BABYLON.Vector3(1, 0, 0), width);
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
        for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
            var point = points_2[_i];
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
            for (var _i = 0, points_3 = points; _i < points_3.length; _i++) {
                var point = points_3[_i];
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
        this.simpleMovableGraph.onPointerEvent(evt, pickingInfo);
        this.simplePath.onPointerEvent(evt, pickingInfo);
    };
    LineEditor.prototype.Tick = function (deltaTime) {
        this.simplePath.update(deltaTime);
    };
    return LineEditor;
}());
/// <reference path="./actor.ts"/>
/// <reference path="./graph.ts"/>
/// <reference path="./drawingPlane.ts"/>
/// <reference path="./editor.ts"/>
var canvas = (document.getElementById("renderCanvas"));
var engine = new BABYLON.Engine(canvas, true);
//потом занести это создание прямо в плоскость, в которой рисуют
var editor;
var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    editor = new LineEditor("editor", scene);
    var light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 10, 20), scene);
    var freeCamera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 0, -30), scene);
    freeCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    scene.onPointerDown = function (evt, pickResult) {
        editor.onPointerEvent(evt, pickResult);
    };
    return scene;
};
var scene = createScene();
engine.runRenderLoop(function () {
    scene.render();
    var deltaTime = engine.getDeltaTime();
    editor.Tick(deltaTime);
});
window.addEventListener("resize", function () {
    engine.resize();
});
var changeColorButtonClick = function () {
    scene.clearColor = new BABYLON.Color3(1, 1, 0);
};
var closeGraph = function () {
    editor.finishEditingPath();
};
var finishGraph = function () {
    editor.finishEditingMovable();
};
var huyButton = document.getElementById("huy");
huyButton.onclick = changeColorButtonClick;
var closeButton = document.getElementById("close");
closeButton.onclick = closeGraph;
var finishButton = document.getElementById("finish");
finishButton.onclick = finishGraph;
