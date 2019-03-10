let scene, renderer, container, controls;
let FOV, aspect, nearPlane, farPlane, WIDTH, HEIGHT;

let cubesMesh;
let cubeMesh;
let cubesGroup;
let particleSystem, particles;

const NR_PARTICLES = 1800;
const COLORS = {
    black: 0x000000,
    white: 0xffffff,
    red: 0xff7f7c,
    blue: 0xaddaff,
    yellow: 0xfff17c 
};


const mixers = [];

var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const clock = new THREE.Clock();

init();

function init() {
    createScene();
    createRenderer();
    createCamera();
    createControls();
    createLights();
    createFog();
    createParticleSystem(COLORS.blue);
    createCubeRandMesh(7);
    // loadModels();

    renderer.setAnimationLoop( () => {
        stats.begin();
        update();
        render();
        stats.end();
    });
}


function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    
    // Add the DOM element of the renderer to the container
    container = document.querySelector('#world');   
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color('white');
    
    // Add listener to screen, resize etc
    window.addEventListener('resize', handleWindowResize, false);
}

// RENDER
function createRenderer() {
    // Render settings
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setClearColor(COLORS.black);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    renderer.gammaFactor = 2.0;
    renderer.gammaOutput = true;
    renderer.physicallyCorrectLights = true;
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default

    container.appendChild(renderer.domElement);
}


// CAMERA
function createCamera() {
    // Camera settings
    aspect = WIDTH / HEIGHT;
    FOV = 35;
    nearPlane = 0.1;
    farPlane = 1000;
    
    camera = new THREE.PerspectiveCamera(
        FOV,
        aspect,
        nearPlane,
        farPlane
    );
        
    camera.position.set(0, 10, 20);
    camera.lookAt(scene.position);
        
    scene.add(camera);
}

// CONTROLS
function createControls() {
    controls = new THREE.OrbitControls(camera, container);
    controls.enablePan = false;
	controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
	controls.rotateSpeed = 0.05;

    controls.maxAzimuthAngle = 1;
    controls.minAzimuthAngle = -1;
    controls.maxPolarAngle   = 2.0;
    controls.minPolarAngle   = 0.7;
}

// LIGHTING
function createLights() {
    //var ambLight = new THREE.AmbientLight(0x404040, 4.0);
    const ambLight = new THREE.HemisphereLight(
        0xddeeff, // bright sky color
        0x202020, // dim ground color
        5, // intensity
    );

    var dirLight1 = new THREE.DirectionalLight(0xffffff, 3.0); //5.0
    var dirLight2 = new THREE.DirectionalLight(0xffffff, 2.0);
   
    dirLight1.position.set( 100, 100, 100 );
    dirLight1.castShadow = true;

    dirLight2.position.set( 0, 100, 200 );
    dirLight2.castShadow = true;

    // shadow properties for direct light
    dirLight1.shadow.mapSize.height = 512;
    dirLight1.shadow.mapSize.width = 512;
    dirLight1.shadow.camera.near = 0.5;
    dirLight1.shadow.far = 10;

    var helperDir1 = new THREE.CameraHelper( dirLight1.shadow.camera );
    var helperDir2 = new THREE.CameraHelper( dirLight2.shadow.camera );

    scene.add(
        ambLight, 
        dirLight1,
        dirLight2,
        // helperDir1,
        // helperDir2
    );
}

// CREATE FOG
function createFog() {
    var fogColor = new THREE.Color(COLORS.white);
    scene.background = fogColor;
    //scene.fog = new THREE.Fog(fogColor, 0.0025, 80);
    scene.fog = new THREE.FogExp2(fogColor, 0.02);
}

// PARTICLE SYSTEM
function createParticleSystem(color) {
    c = 0x000000;
    particles = new THREE.Geometry();
    let material  = new THREE.PointsMaterial({
        color: color,
        size: 5.5,
        transparent: true
    }); 

    for (let p = 0; p < NR_PARTICLES; p++) {
        let pX = Math.random() * 90 - 45,
            pY = Math.random() * 90 - 45,
            pZ = Math.random() * 90 - 45;
        
        const dist = Math.sqrt(Math.pow(pX - camera.position.x, 2) + 
                               Math.pow(pY - camera.position.y, 2) + 
                               Math.pow(pZ - camera.position.z, 2) );
        
        if ( dist > 30 ){
            particle = new THREE.Vector3(pX, pY, pZ);
            particle.velocity = new THREE.Vector3(0, -Math.random(), 0);
            particles.vertices.push(particle) 
        }
    }

    particleSystem = new THREE.Points(
        particles,
        material
    );
    scene.add(particleSystem);
}

/* ------------ Create Cubes -------------- */
function cubeMaterials() {
    const red = new THREE.MeshStandardMaterial({
        color: 0xff7f7c,
        flatShading: false,
        opacity: 0.9
    });
    const yellow = new THREE.MeshStandardMaterial({
        color: 0xfff17c,
        flatShading: true,
    });
    const blue = new THREE.MeshStandardMaterial({
        color: 0xaddaff,
        flatShading: true,
    });

    var colors = [red, yellow, blue];

    return colors;
}

function cubeGeometry() {
    const cube = new THREE.BoxBufferGeometry(1, 1, 1);
    return cube;
}

function createCubesGeometry() {
    const cubeSmall = new THREE.BoxBufferGeometry(0.8, 0.8, 0.8);
    const cubeMedium = new THREE.BoxBufferGeometry(2, 2, 2);
    const cubeLarge = new THREE.BoxBufferGeometry(3, 3, 3);
    
    return {
        cubeSmall,
        cubeMedium,
        cubeLarge
    }
}

function createCubeRandMesh(objectsPerRow) {
    let randX, randY, randZ, randRot, randColor;
    const randInterval = objectsPerRow * 5;

    cubesGroup = new THREE.Group();
    scene.add(cubesGroup);
    
    const materials = cubeMaterials();
    const geometries = createCubesGeometry();
    cubesMesh = new THREE.Mesh(geometries.cubeSmall, materials[0]);

    // Shadow settings
    cubesMesh.castShadow = true;
    cubesMesh.receiveShadow = true;

    var nrOfCubes = Math.pow(objectsPerRow, 3);
    for ( let i = 0; i < nrOfCubes; i++ ) {
        var cMesh = cubesMesh.clone();
        randRot = Math.random() * 0.2;
        // randColor = Math.floor(Math.random() * 3);
        randX = Math.random() * randInterval - (randInterval/2);
        randY = Math.random() * randInterval - (randInterval/2);
        randZ = Math.random() * randInterval - (randInterval/2);
        
        cMesh.position.set(randX, randY, randZ);
        cMesh.rotation.set(randRot, -randRot, randRot);
        // cMesh.material.color.set(materials[randColor].color);
        cubesGroup.add(cMesh);
    }
}

function createCubeGridMesh(objectsPerRow) {
    cubesGroup = new THREE.Group();
    scene.add(cubesGroup);
    
    const materials = cubeMaterials();
    const geometries = createCubesGeometry();
    
    const offset = 2;
    const startPos = objectsPerRow;
    let pos = new THREE.Vector3( -startPos , -startPos, -10);
    
    cubesMesh = new THREE.Mesh(geometries.cubeSmall, materials.red);
    cubesMesh.rotation.set(0.5, 0.5, 0.5);

    // Shadow settings
    cubesMesh.castShadow = true;
    cubesMesh.receiveShadow = true;

    // Grid
    for (let zPos = 0; zPos < objectsPerRow; zPos++)
    {
        for (let yPos = 0; yPos < objectsPerRow; yPos++)
        {
            for (let xPos = 0; xPos < objectsPerRow; xPos++)
            {
                var cMesh = cubesMesh.clone();
                cMesh.position.set(pos.x, pos.y, pos.z);
                cubesGroup.add(cMesh);
                pos.x += offset;
            }
            pos.x = -startPos;
            pos.y += offset;
        }
        pos.z -= offset;
        pos.y = -startPos;
    }
}

/* ---------------------------------------- */

// HANDLE WINDOW RESIZE
function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio( window.devicePixelRatio );
}

function stop() {
    renderer.setAnimationLoop(null);
}

function update() {

    //particleSystem.rotation.y += 0.0001;
    let pCount = NR_PARTICLES;

    // while (pCount--) {
    //     let particle = particles.vertices[pCount];
    //     console.log(particle);

    //     if (particle.y < -200) {
    //         particle.position.y = 200;
    //         particle.velocity.y= 0;
    //     }

    //     particle.velocity.y -= Math.random() * 0.1;
    //     particle.position.addSelf(particle.velocity); //ERROR 

    //     particleSystem.geometry.__dirtyVertices = true;
    // }
    
    // cubesMesh.rotation.x += 0.005;
    // cubesMesh.rotation.y += 0.005;
    // cubesMesh.rotation.z -= 0.005;
    
    
    // stork animation
    // const delta = clock.getDelta();
    // mixers.forEach( (mixer) => { mixer.update(delta); } );
    
    // cubes animation
    // cubesGroup.position.x += Math.cos(delta);
    
    controls.update();
}

function render() {
    // mesh.geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
}



function loadModels() {
    const loader = new THREE.GLTFLoader();
    loader.setCrossOrigin('true');

    const onLoad = ( gltf, position ) => {
  
      const model = gltf.scene.children[ 0 ];
      model.position.copy( position );
  
      const animation = gltf.animations[ 0 ];
  
      const mixer = new THREE.AnimationMixer( model );
      mixers.push( mixer );
  
      const action = mixer.clipAction( animation );
      action.play();
  
      scene.add( model );
    };

    const onProgress = () => {};
    const onError = ( errorMessage ) => { console.log( errorMessage ); };    
    
    const storkPosition = new THREE.Vector3( 0, -2.5, -100 );
    // const storkScale = new THREE.Vector3( 0.2, 0.2, 0.2 );
    loader.load( 'models/Stork.glb', gltf => onLoad( gltf, storkPosition ), onProgress, onError );
  }