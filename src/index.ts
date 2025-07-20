import * as THREE from 'three';
import Fish, { FishName, FISH_NAMES } from "./Fish";
import { XYZ } from "./types";
import { addOrbitControls, getRandomNumber, mapXYZ, resizeFullScreen } from "./utils";
import { BoidsSystem } from './Boids';
import { AquariumBox } from "./AquariumBox";

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let boidsSystem: BoidsSystem;
let aquarium: AquariumBox;

// UI Elements
let addFishButton: HTMLButtonElement;
let fishTypeSelect: HTMLSelectElement;
let fishCountInput: HTMLInputElement;

function initCameraPosition(camera: THREE.PerspectiveCamera) {
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 50;
    camera.lookAt(0, 0, 0);
}

function addLights(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(-1, 10, 0);
    scene.add(directionalLight);
}

function initUI() {
    // Create control panel container
    const controlsPanel = document.createElement('div');
    controlsPanel.style.position = 'fixed';
    controlsPanel.style.top = '10px';
    controlsPanel.style.left = '10px';
    controlsPanel.style.backgroundColor = 'rgba(0,0,0,0.0)';
    controlsPanel.style.padding = '10px';
    controlsPanel.style.borderRadius = '5px';
    controlsPanel.style.color = 'white';
    controlsPanel.style.zIndex = '100';

    // Create fish type dropdown
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Tipo de Pez: ';
    typeLabel.style.marginRight = '10px';
    
    fishTypeSelect = document.createElement('select');
    FISH_NAMES.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        fishTypeSelect.appendChild(option);
    });

    // Create count input
    const countLabel = document.createElement('label');
    countLabel.textContent = ' Cantidad: ';
    countLabel.style.marginLeft = '10px';
    countLabel.style.marginRight = '5px';
    
    fishCountInput = document.createElement('input');
    fishCountInput.type = 'number';
    fishCountInput.value = '1';
    fishCountInput.min = '1';
    fishCountInput.max = '10';
    fishCountInput.style.width = '50px';

    // Create add button
    addFishButton = document.createElement('button');
    addFishButton.textContent = 'Añadir Pez(es)';
    addFishButton.style.marginLeft = '10px';
    addFishButton.addEventListener('click', addFishHandler);

    // Create team members section
    const teamSection = document.createElement('div');
    teamSection.style.marginTop = '15px';
    teamSection.style.fontSize = '0.9em';
    
    const teamTitle = document.createElement('h3');
    teamTitle.textContent = 'Integrantes del Proyecto';
    teamTitle.style.margin = '0 0 5px 0';
    
    const teamList = document.createElement('ul');
    teamList.style.listStyle = 'none';
    teamList.style.padding = '0';
    teamList.style.margin = '0';
    
    const members = [
        'Ramirez Vidal Brayam Victor',
        'Jon Alex Chuqui Mamani',
        'Sergio Raúl Choque Cormilluni'
    ];
    
    members.forEach(member => {
        const li = document.createElement('li');
        li.textContent = member;
        li.style.marginBottom = '3px';
        teamList.appendChild(li);
    });

    teamSection.appendChild(teamTitle);
    teamSection.appendChild(teamList);

    // Assemble UI
    const row1 = document.createElement('div');
    row1.style.display = 'flex';
    row1.style.alignItems = 'center';
    row1.style.marginBottom = '10px';
    
    row1.appendChild(typeLabel);
    row1.appendChild(fishTypeSelect);
    row1.appendChild(countLabel);
    row1.appendChild(fishCountInput);
    row1.appendChild(addFishButton);

    controlsPanel.appendChild(row1);
    controlsPanel.appendChild(teamSection);
    document.body.appendChild(controlsPanel);
}

async function addFishHandler() {
    const type = fishTypeSelect.value as FishName;
    const count = parseInt(fishCountInput.value);
    
    for (let i = 0; i < count; i++) {
        await addFishToAquarium(type);
    }
}

async function addFishToAquarium(type: FishName) {
    const fish = await Fish.create(type, scene);
    
    // Position within aquarium bounds
    const min = aquarium.getMinPosition();
    const max = aquarium.getMaxPosition();
    fish.setPosition([
        THREE.MathUtils.randFloat(min.x, max.x),
        THREE.MathUtils.randFloat(min.y, max.y),
        THREE.MathUtils.randFloat(min.z, max.z)
    ]);
    
    // Add to boids system
    boidsSystem.addBoid(type, fish.group);
}

async function main() {
    const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
    const { innerHeight: height, innerWidth: width } = window;

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ canvas: mainCanvas, alpha: true });
    renderer.setSize(width, height);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    renderer.setSize(width, height);

    initCameraPosition(camera);
    addOrbitControls(camera, mainCanvas);
    addLights(scene);
    resizeFullScreen(renderer, camera);
    renderer.setClearColor(0x000000, 0);

    // Inicializar aquarium y boids system
    aquarium = new AquariumBox(80);
    scene.add(aquarium.getBox());
    scene.add(aquarium.getWater());
    
    boidsSystem = new BoidsSystem(aquarium);

    // Initialize UI
    initUI();

    // Create initial fish
    await createInitialFish();

    function animate() {
        requestAnimationFrame(animate);
        boidsSystem.updateBoids();
        renderer.render(scene, camera);
    }

    animate();
}

async function createInitialFish() {
    // Create initial fish groups
    await createFishGroup("BlueGoldfish", 3);
    await createFishGroup("CoralGrouper", 3);
    await createFishGroup("Sunfish", 3);
}

async function createFishGroup(fishName: FishName, count: number) {
    for (let i = 0; i < count; i++) {
        await addFishToAquarium(fishName);
    }
}

main();
