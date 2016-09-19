interface Translatable{
    setLocation(position: BABYLON.Vector3): void;
    addTranslation(position: BABYLON.Vector3): void;
    getAbsoluteLocation(): BABYLON.Vector3;
}

interface Rotatable{
    setZRotation(angle: number): void;
    addZRotation(angle: number): void;
    getZRotation(): number;
}



abstract class Movable implements Translatable, Rotatable{
    abstract setLocation(position: BABYLON.Vector3): void;
    abstract addTranslation(position: BABYLON.Vector3): void;
    abstract getAbsoluteLocation(): BABYLON.Vector3;
    abstract setZRotation(angle: number): void;
    abstract addZRotation(angle: number): void;
    abstract getZRotation(): number;

    protected toRadians(degrees: number): number{
        return  degrees * (Math.PI/180);
    }

    public linearSpeed:number;
    public angularSpeed:number;

    public move(direction: BABYLON.Vector3, deltaTime: number){
        let delta = this.linearSpeed * deltaTime;
        this.addTranslation(direction.multiplyByFloats(delta, delta, delta));
    }

    public turn(deltaTime: number){
        let deltaAngle = this.angularSpeed * deltaTime;
        this.addZRotation(deltaAngle);
    }

}

abstract class BaseLineMovable extends Movable{
    protected lineMesh: BABYLON.LinesMesh;
    protected name: string;
    protected points: BABYLON.Vector3[];
    protected scene: BABYLON.Scene;
    constructor(name:string, points: BABYLON.Vector2[], scene: BABYLON.Scene){
        super();
        this.scene = scene;
        this.points = [];
        for (var p of points){
            this.points.push(new BABYLON.Vector3(p.x, p.y, 0));
        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.points, scene, true);
    }
}



class SimpleMovable extends BaseLineMovable{
    
    setLocation(position: BABYLON.Vector3): void
    {
        let position3d = new BABYLON.Vector3(position.x, position.y, 0);
        let current = this.lineMesh.getAbsolutePosition();
        let diff2: BABYLON.Vector3 = position3d.subtract(current);
        this.lineMesh.translate(diff2, 1, BABYLON.Space.WORLD);
    }
    addTranslation(position: BABYLON.Vector3): void
    {
        let current = this.getAbsoluteLocation();
        this.setLocation(current.add(position));
    }
    getAbsoluteLocation(): BABYLON.Vector3
    {
        return this.lineMesh.getAbsolutePosition();
    }
    setZRotation(angle: number): void
    {
        let radians: number = this.toRadians(angle);
        this.lineMesh.rotate(BABYLON.Axis.Z, radians, BABYLON.Space.LOCAL);
    }
    addZRotation(angle: number): void
    {
        let current = this.getZRotation();
        this.setZRotation(current + angle);
    }
    getZRotation(): number
    {
        return this.lineMesh.rotation.z;
    }
}