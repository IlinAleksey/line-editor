/// <reference path="./actor.ts"/>
/// <reference path="./graph.ts"/>
/// <reference path="./drawingPlane.ts"/>
/// <reference path="./editor.ts"/>
/// <reference path="./ilyin.ts"/>
var canvas: HTMLCanvasElement = <HTMLCanvasElement>(document.getElementById("renderCanvas"));

var engine = new BABYLON.Engine(canvas, true);

//потом занести это создание прямо в плоскость, в которой рисуют


var editor: NameEditor;

var createScene = function(){
    
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

    editor = new NameEditor("editor", scene);
scene.onPointerDown = function (evt, pickResult) {
        editor.onPointerDown(evt, pickResult);
    };
    scene.onPointerUp = function(evt, pickResult) {
        editor.onPointerUp(evt, pickResult);
    }
    scene.onPointerMove = function(evt, pickResult) {
        editor.onPointerMove(evt, pickResult);
    }
    return scene;
}

var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
    let deltaTime = engine.getDeltaTime();
    // editor.Tick(deltaTime);
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
        //editor.finishEditingPath();
    };

let finishGraph : () => any = 
    function () : any{
        //editor.finishEditingMovable();
    };

let saveJson: () => any = function(): any{
    let textarea = <HTMLTextAreaElement>document.getElementById("json_save");
    textarea.value = editor.saveJsonData();
}

let loadJson: () => any = function(): any{
    let textarea = <HTMLTextAreaElement>document.getElementById("json_save");
    editor.loadComplexVectorData(JSON.parse(textarea.value));
}

let loadName: () => any = function(): any{
    editor.loadComplexVectorData(complexIlyinName);
}

var huyButton = <HTMLButtonElement>document.getElementById("huy");
huyButton.onclick = changeColorButtonClick;

var closeButton = <HTMLButtonElement>document.getElementById("close");
closeButton.onclick = closeGraph;

var finishButton = <HTMLButtonElement>document.getElementById("finish");
finishButton.onclick = finishGraph;

var saveButton = <HTMLButtonElement>document.getElementById("save");
saveButton.onclick = saveJson;

var loadButton = <HTMLButtonElement>document.getElementById("load");
loadButton.onclick = loadJson;

var nameButton = <HTMLButtonElement>document.getElementById("name");
nameButton.onclick = loadName;
