// src/Fish.ts
import { Scene, Vector3 } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import AnimationController from "./AnimationController";
import DeltaTimer from "./DeltaTimer";
import { XYZ } from "./types";
import { getGltf } from "./utils";
import {AquariumBox} from "./AquariumBox";

const FISH_FILE_ROOT_PATH = "./glb/fish/";
const aquariumBox = new AquariumBox(70); // Tamaño de la pecera

export const FISH_NAMES = ["BlueGoldfish", "Piranha", "CoralGrouper", "Sunfish"] as const;
export type FishName = typeof FISH_NAMES[number];

export default class Fish {
    private deltaTimer = new DeltaTimer();
    animationController: AnimationController;
    private velocity: XYZ | null = null;

    static async create(fishName: FishName, scene: Scene) {
        const gltf = await getFishGltf(fishName);
        return new Fish(gltf, scene);
    }

    get group() {
        return this.gltf.scene;
    }

    private constructor(private gltf: GLTF, private scene: Scene) {
        this.animationController = new AnimationController(gltf, this.deltaTimer);
        this.animationController.playAction(0);
        this.deltaTimer.addRequestAnimationFrameHandler(this.move);
        scene.add(gltf.scene);
        scene.add(aquariumBox.getBox()); // Add the aquarium box to the scene
    }

    destroy() {
        this.animationController.destroy();
        this.deltaTimer.removeRequestAnimationFrameHandler(this.move);
    }

    move = (deltaTime: number) => {
        if (this.velocity) {
            const [x, y, z] = this.velocity.map(scale => (deltaTime) * scale);
            this.group.position.x += x;
            this.group.position.y += y;
            this.group.position.z += z;

            // Limit the movement within the aquarium
            this.group.position.x = Math.max(aquariumBox.getMinPosition().x, Math.min(aquariumBox.getMaxPosition().x, this.group.position.x));
            this.group.position.y = Math.max(aquariumBox.getMinPosition().y, Math.min(aquariumBox.getMaxPosition().y, this.group.position.y));
            this.group.position.z = Math.max(aquariumBox.getMinPosition().z, Math.min(aquariumBox.getMaxPosition().z, this.group.position.z));
        }
    }

    setPosition(xyz: XYZ) {
        const [x, y, z] = xyz;
        this.group.position.x = x;
        this.group.position.y = y;
        this.group.position.z = z;
    }

    setVelocity(xyz: XYZ) {
        this.velocity = xyz;
        const [x, y, z] = xyz;
        this.group.lookAt(this.group.position.clone().add(new Vector3(x, y, z)));
    }
}

export async function getFishGltf(fishName: FishName) {
    return await getGltf(getFishGlbPath(fishName));
}

function getFishGlbPath(fishName: FishName) {
    return `${FISH_FILE_ROOT_PATH}${fishName}.glb`;
}