let scene, renderer, container, controls;
let FOV, aspect, nearPlane, farPlane, WIDTH, HEIGHT;

let cubeMesh;
const mixers = [];

const clock = new THREE.Clock();

init();

function init() {
    createScene();
    createRenderer();
    createCamera();
    createControls();
    createLights();
    createCubesMesh(10);
    // loadModels();

    renderer.setAnimationLoop( () => {
        update();
        render();
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
    renderer.setClearColor(0x000000);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    renderer.shadowMap.enabled = true;
    renderer.gammaFactor = 2.0;
    renderer.gammaOutput = true;
    renderer.physicallyCorrectLights = true;

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
}

// LIGHTING
function createLights() {
    //var ambLight = new THREE.AmbientLight(0x404040, 4.0);
    const ambLight = new THREE.HemisphereLight(
        0xddeeff, // bright sky color
        0x202020, // dim ground color
        5, // intensity
    );

    var dirLight = new THREE.DirectionalLight(0xffffff, 5.0);
    dirLight.position.set( 10, 10, 10 );

    scene.add(
        ambLight, 
        dirLight
    );
}

// ADD BOX
function addBox() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshStandardMaterial({
        color: 0xfc6d76,
        side: THREE.DoubleSide
    });
    cubeMesh = new THREE.Mesh(geometry, material);

    scene.add(cubeMesh);
}

/* ------------ Create Cubes -------------- */
function cubeMaterials() {
    const red = new THREE.MeshStandardMaterial({
        color: 0xff3333,
        flatShading: true,
    });
    const yellow = new THREE.MeshStandardMaterial({
        color: 0xfef59c,
        flatShading: true,
    });
    const blue = new THREE.MeshStandardMaterial({
        color: 0xaddaff,
        flatShading: true,
    });

    return {
        red,
        yellow,
        blue,
    };
}

function cubeGeometry() {
    const cube = new THREE.BoxBufferGeometry(1, 1, 1);
    return cube;
}

function createCubesGeometry() {
    const cubeSmall = new THREE.BoxBufferGeometry(1, 1, 1);
    const cubeMedium = new THREE.BoxBufferGeometry(2, 2, 2);
    const cubeLarge = new THREE.BoxBufferGeometry(3, 3, 3);
    
    return {
        cubeSmall,
        cubeMedium,
        cubeLarge
    }
}

function createCubesMesh(objectsPerRow) {
    const cubes = new THREE.Group();
    scene.add(cubes);
    
    const materials = cubeMaterials();
    const geometries = createCubesGeometry();
    
    const offset = 2;
    const startPos = objectsPerRow;
    let pos = new THREE.Vector3( -startPos , -startPos, -10);

    console.log(materials);
    console.log(geometries);
    
    var cubeMesh = new THREE.Mesh(geometries.cubeSmall, materials.red);
    
    for (let zPos = 0; zPos < objectsPerRow; zPos++)
    {
        for (let yPos = 0; yPos < objectsPerRow; yPos++)
        {
            for (let xPos = 0; xPos < objectsPerRow; xPos++)
            {
                var cubeMesh = cubeMesh.clone();
                cubeMesh.position.set(pos.x, pos.y, pos.z);
                cubes.add(cubeMesh);
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
    // cubeMesh.rotation.x += 0.005;
    // cubeMesh.rotation.y += 0.005;
    // cubeMesh.rotation.z -= 0.005;

    // stork animation
    const delta = clock.getDelta();
    mixers.forEach( (mixer) => { mixer.update(delta); } );
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