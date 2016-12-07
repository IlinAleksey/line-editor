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

interface Destroyable{
    destroy(): void;
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
    protected scene: BABYLON.Scene;
    protected fuck: BABYLON.Vector3[];
    constructor(name:string, points2d: BABYLON.Vector2[], scene: BABYLON.Scene){
        super();
        
        this.scene = scene;
        this.fuck = [];

        for (var p of points2d){

            this.fuck.push(new BABYLON.Vector3(p.x, p.y, 0));

        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.fuck, scene, true);
    }

    destroy(): void{
        this.lineMesh.dispose();
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

class LinAlgMovable extends BaseLineMovable{

    protected rotation: number; 

    constructor(name:string, points2d: BABYLON.Vector2[], scene: BABYLON.Scene){
        super(name, points2d, scene);
        this.linearSpeed = 0.1;
        this.angularSpeed = 0.1;
    }


    protected rotateVectorAroundOrigin(vector: BABYLON.Vector3, angle:number): BABYLON.Vector3
    {
        return new BABYLON.Vector3(
            vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
            vector.y * Math.cos(angle) + vector.x * Math.sin(angle),
            0);
    }

    protected rotateAroundOrigin(vector: BABYLON.Vector3, pivot: BABYLON.Vector3, angle:number): BABYLON.Vector3
    {
        let translated = vector.subtract(pivot);
        let rotated =  this.rotateVectorAroundOrigin(translated, angle);
        let translatedBack = rotated.add(pivot);
        translatedBack.z = 0;
        return translatedBack;
    }

    private addAngleToRotation(angle: number): void
    {
        this.rotation += angle;
        if (this.rotation > Math.PI)
        {
            this.rotation -= 2 * Math.PI;
        }
        else if (this.rotation < Math.PI)
        {
            this.rotation += 2 * Math.PI;
        }
    }

    private getAverage(): BABYLON.Vector3
    {
        var sum = new BABYLON.Vector3(0,0,0);
        for (let position of this.fuck)
        {
            sum = sum.add(position);
            
        }
        let average = sum.divide(new BABYLON.Vector3(this.fuck.length, this.fuck.length, 1));
        return average;
    }

    getAbsoluteLocation() : BABYLON.Vector3
    {
        return this.getAverage();
    }

    setLocation(position: BABYLON.Vector3): void
    {
        let position3d = new BABYLON.Vector3(position.x, position.y, 0);
        let average = this.getAbsoluteLocation();
        let diff = position3d.subtract(average);
        diff.z = 0;
        
        this.addTranslation(diff);
    }
    addTranslation(position: BABYLON.Vector3): void
    {
        for (let index in this.fuck)
        {
            this.fuck[index].addInPlace(position)
        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.fuck, scene, true, this.lineMesh)
    }
    setZRotation(angle: number): void
    {
        let cur = this.getZRotation();
        let diff = angle - cur;
        this.addZRotation(diff);
    }
    addZRotation(angle: number): void
    {
        let radians: number = this.toRadians(angle);
        this.addAngleToRotation(radians);
        let pivot = this.getAverage();
        for (let index in this.fuck)
        {
            this.fuck[index] = this.rotateAroundOrigin(this.fuck[index], pivot, radians);
        }
        this.lineMesh = BABYLON.Mesh.CreateLines(name, this.fuck, scene, true, this.lineMesh);
    }
    getZRotation(): number
    {
        return this.rotation;
    }
}