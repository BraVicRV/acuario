import * as THREE from 'three';

export class AquariumBox {
    private box: THREE.Mesh;
    private water: THREE.Mesh;
    private size: number;
    private padding: number;

    constructor(size: number) {
        this.size = size;
        this.padding = size * 0.05; // 5% de padding interno
        
        // Caja del acuario (semi-transparente)
        const boxGeometry = new THREE.BoxGeometry(size, size, size);
        const boxMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide,
            wireframe: false
        });
        this.box = new THREE.Mesh(boxGeometry, boxMaterial);
        
        // Agua del acuario
        const waterGeometry = new THREE.BoxGeometry(size, size, size);
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a8cff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
    }

    getBox(): THREE.Mesh {
        return this.box;
    }

    getWater(): THREE.Mesh {
        return this.water;
    }

    // Límites con padding interno para evitar que los peces toquen las paredes
    getMinPosition(): THREE.Vector3 {
        const halfSize = this.size / 2 - this.padding;
        return new THREE.Vector3(-halfSize, -halfSize, -halfSize);
    }

    getMaxPosition(): THREE.Vector3 {
        const halfSize = this.size / 2 - this.padding;
        return new THREE.Vector3(halfSize, halfSize, halfSize);
    }

    // Método para verificar si una posición está dentro del acuario
    isInside(position: THREE.Vector3): boolean {
        const min = this.getMinPosition();
        const max = this.getMaxPosition();
        return (
            position.x >= min.x && position.x <= max.x &&
            position.y >= min.y && position.y <= max.y &&
            position.z >= min.z && position.z <= max.z
        );
    }

    // Método para corregir una posición fuera de los límites
    clampPosition(position: THREE.Vector3): THREE.Vector3 {
        const min = this.getMinPosition();
        const max = this.getMaxPosition();
        return new THREE.Vector3(
            THREE.MathUtils.clamp(position.x, min.x, max.x),
            THREE.MathUtils.clamp(position.y, min.y, max.y),
            THREE.MathUtils.clamp(position.z, min.z, max.z)
        );
    }
}