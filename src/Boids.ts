import * as THREE from 'three';
import { AquariumBox } from './AquariumBox';

export class Boid {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    mesh?: THREE.Group;
    type: string;
    maxSpeed: number = 0.05;
    maxForce: number = 0.005;
    perceptionRadius: number = 10;
    separationDistance: number = 8;
    private aquarium: AquariumBox;

    constructor(type: string, aquarium: AquariumBox) {
        this.aquarium = aquarium;
        const min = aquarium.getMinPosition();
        const max = aquarium.getMaxPosition();
        
        // Posición inicial aleatoria dentro del acuario
        this.position = new THREE.Vector3(
            THREE.MathUtils.randFloat(min.x, max.x),
            THREE.MathUtils.randFloat(min.y, max.y),
            THREE.MathUtils.randFloat(min.z, max.z)
        );
        
        // Velocidad inicial aleatoria
        this.velocity = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        ).normalize();
        
        this.acceleration = new THREE.Vector3();
        this.type = type;
    }

    update(boids: Boid[]): void {
        const sameTypeBoids = boids.filter(b => b !== this && b.type === this.type);
        
        this.separation(sameTypeBoids);
        this.alignment(sameTypeBoids);
        this.cohesion(sameTypeBoids);
        this.boundaries();

        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.set(0, 0, 0);

        // Asegurar que el pez permanezca dentro del acuario
        this.position = this.aquarium.clampPosition(this.position);

        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                this.velocity.clone().normalize()
            );
        }
        // ...dentro del método update, justo antes de actualizar la posición y el mesh...

        // Detección básica de colisión: separación forzada si están demasiado cerca
        for (const other of boids) {
            if (other !== this) {
                const minDistance = 5;// distancia mínima permitida entre peces
                const d = this.position.distanceTo(other.position);
                if (d < minDistance) {
                    // Mueve este pez lejos del otro
                    const away = new THREE.Vector3().subVectors(this.position, other.position).normalize().multiplyScalar(minDistance - d);
                    this.position.add(away);
                }
            }
        }

// ...continúa el método update...
    }

    applyForce(force: THREE.Vector3): void {
        this.acceleration.add(force);
    }

    separation(boids: Boid[]): void {
        const steer = new THREE.Vector3();
        let total = 0;

        for (const other of boids) {
            const d = this.position.distanceTo(other.position);
            if (d > 0 && d < this.separationDistance) {
                const diff = new THREE.Vector3().subVectors(this.position, other.position);
                diff.divideScalar(d * d);
                steer.add(diff);
                total++;
            }
        }

        if (total > 0) {
            steer.divideScalar(total);
            steer.setLength(this.maxSpeed);
            steer.sub(this.velocity);
            steer.clampLength(0, this.maxForce);
            this.applyForce(steer);
        }
    }

    alignment(boids: Boid[]): void {
        const sum = new THREE.Vector3();
        let total = 0;

        for (const other of boids) {
            const d = this.position.distanceTo(other.position);
            if (d > 0 && d < this.perceptionRadius) {
                sum.add(other.velocity);
                total++;
            }
        }

        if (total > 0) {
            sum.divideScalar(total);
            sum.setLength(this.maxSpeed);
            const steer = new THREE.Vector3().subVectors(sum, this.velocity);
            steer.clampLength(0, this.maxForce);
            this.applyForce(steer);
        }
    }

    cohesion(boids: Boid[]): void {
        const sum = new THREE.Vector3();
        let total = 0;

        for (const other of boids) {
            const d = this.position.distanceTo(other.position);
            if (d > 0 && d < this.perceptionRadius) {
                sum.add(other.position);
                total++;
            }
        }

        if (total > 0) {
            sum.divideScalar(total);
            const desired = new THREE.Vector3().subVectors(sum, this.position);
            desired.setLength(this.maxSpeed);
            const steer = new THREE.Vector3().subVectors(desired, this.velocity);
            steer.clampLength(0, this.maxForce);
            this.applyForce(steer);
        }
    }

    boundaries(): void {
        const turnFactor = 0.5; // Aumentado para un giro más brusco al acercarse a los bordes
        const min = this.aquarium.getMinPosition();
        const max = this.aquarium.getMaxPosition();
        const margin = 2; // Margen para comenzar a girar antes de llegar al borde

        if (this.position.x < min.x + margin) this.velocity.x += turnFactor;
        if (this.position.x > max.x - margin) this.velocity.x -= turnFactor;
        if (this.position.y < min.y + margin) this.velocity.y += turnFactor;
        if (this.position.y > max.y - margin) this.velocity.y -= turnFactor;
        if (this.position.z < min.z + margin) this.velocity.z += turnFactor;
        if (this.position.z > max.z - margin) this.velocity.z -= turnFactor;
    }
}

export class BoidsSystem {
    boids: Boid[];
    private aquarium: AquariumBox;

    constructor(aquarium: AquariumBox) {
        this.aquarium = aquarium;
        this.boids = [];
    }

    addBoid(type: string, mesh: THREE.Group): Boid {
        const boid = new Boid(type, this.aquarium);
        boid.mesh = mesh;
        this.boids.push(boid);
        return boid;
    }

    updateBoids(): void {
        for (const boid of this.boids) {
            boid.update(this.boids);
        }
    }
}