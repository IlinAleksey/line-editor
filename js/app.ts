/// <reference path="./actor.ts"/>
/// <reference path="./graph.ts"/>
/// <reference path="./drawingPlane.ts"/>
/// <reference path="./editor.ts"/>

var canvas: HTMLCanvasElement = <HTMLCanvasElement>(document.getElementById("renderCanvas"));

var engine = new BABYLON.Engine(canvas, true);

//потом занести это создание прямо в плоскость, в которой рисуют


var editor: LineEditor;
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
}

var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
    let deltaTime = engine.getDeltaTime();
    editor.Tick(deltaTime);
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
        editor.finishEditingPath();
    };

let finishGraph : () => any = 
    function () : any{
        editor.finishEditingMovable();
    };

var huyButton = <HTMLButtonElement>document.getElementById("huy");
huyButton.onclick = changeColorButtonClick;

var closeButton = <HTMLButtonElement>document.getElementById("close");
closeButton.onclick = closeGraph;

var finishButton = <HTMLButtonElement>document.getElementById("finish");
finishButton.onclick = finishGraph;
