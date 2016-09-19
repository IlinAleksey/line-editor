/// <reference path="./actor.ts"/>
/// <reference path="./graph.ts"/>
/// <reference path="./drawingPlane.ts"/>

var canvas: HTMLCanvasElement = <HTMLCanvasElement>(document.getElementById("renderCanvas"));

var engine = new BABYLON.Engine(canvas, true);

//потом занести это создание прямо в плоскость, в которой рисуют
var simplePath: SimplePath;

var plane: SimpleInteractiveGraphPlane;
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
}

var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
    let deltaTime = engine.getDeltaTime();
    simplePath.Tick(deltaTime);
});

window.addEventListener("resize", function () {
    engine.resize();

});

let changeColorButtonClick : () => any = 
    function () : any{
        scene.clearColor = new BABYLON.Color3(1, 1, 0);
    };

let closeGraph : () => any = 
    function () : any{
        plane.finishDrawing();

        //тестовая фигура
        let simpleMovable = new SimpleMovable("simple", [new BABYLON.Vector2(20, 0), new BABYLON.Vector2(0, 20),new BABYLON.Vector2(0, 0), new BABYLON.Vector2(20, 0)], scene);
        simpleMovable.angularSpeed = 0.1;
        simpleMovable.linearSpeed = 0.1;

        simplePath.SetMovable(simpleMovable);
        simplePath.StartMoving();
    };

var huyButton = <HTMLButtonElement>document.getElementById("huy");
huyButton.onclick = changeColorButtonClick;

var closeButton = <HTMLButtonElement>document.getElementById("close");
closeButton.onclick = closeGraph;
