import * as THREE from 'three';
import { OrbitControls } from '../libs/three140/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../libs/three140/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../libs/three140/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from '../libs/three140/examples/jsm/loaders/RGBELoader.js';
import { LoadingGIF } from '../libs/LoadingGIF.js';

class App {
	constructor(){

        const container = document.getElementById('animation-container');
        const animationContainer = document.getElementById('animation-container');
        const overlay = document.querySelector('.overlay');

        animationContainer.addEventListener('mousedown', function() {
            overlay.style.display = 'none';
        });
        
        this.pause = false;
        this.moveOut = true; // Flag para determinar la dirección del movimiento

		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		//this.camera.position.set( 0, 0.1, 0.3 );
        this.setupCamera();

		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xFFFFFF );
        
		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
		this.scene.add(ambient);
        
        this.setupLight(this.scene);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		//this.renderer.setSize( window.innerWidth*0.80, window.innerHeight*0.80 );
        //this.renderer.setSize( 800, 600 );
        //this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild( this.renderer.domElement );
		//this.setEnvironment();
        
        this.pieces = []; // Array para almacenar las piezas
        
        this.transitionTime = 0;

        //Add code here to code-along with the video
        this.loadingBar = new LoadingGIF();
        this.loadingBar.setGifSize(150, 150);  // Cambia el tamaño del GIF a 200x200 píxeles
        this.loadGLTF2();

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 0, 0);
        this.setupOrbitCont();
        this.controls.update();

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        container.addEventListener('click', this.onMouseClick.bind(this));

        this.renderer.setAnimationLoop(this.render.bind(this));
        window.addEventListener('resize', this.resize.bind(this));
	}	

    setupLight(scene){
        // Ejemplo de agregar diferentes tipos de luces
        //const ambientLight = new THREE.AmbientLight(0xffffff, 5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
        const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.8);
        //const pointLight = new THREE.PointLight(0xffffff, 0.9);

        directionalLight.position.set(0, 2, -10);
        directionalLight2.position.set(0, 2, 10);
        directionalLight3.position.set(4, 0, 0);
        directionalLight4.position.set(-4, 0, 0);
        //pointLight.position.set(0, 2, 5);

        //scene.add(ambientLight);
        scene.add(directionalLight);
        scene.add(directionalLight2);
        scene.add(directionalLight3);
        scene.add(directionalLight4);
        //scene.add(pointLight);

    }

    /*
    //Static Camera
    setupCamera(){
        this.camera.fov = 75;
        this.camera.updateProjectionMatrix();
        this.camera.position.set( 0.05, 0.005, 0.28 );
    }
    */
    
    // Dinamic Camera
    setupCamera(){
        this.camera.fov = 75;
    
        // Adaptar la posición de la cámara según el tamaño de la ventana
        if (window.innerWidth > window.innerHeight) {
            // Si la ventana es más ancha que alta
            this.camera.position.set( 0.05, 0.005, 0.2 ); // Mover la cámara hacia atrás
        } else {
            // Si la ventana es más alta que ancha
            this.camera.position.set( 0.05, 0.005, 0.28 ); // Mover la cámara más cerca
        }
    
        this.camera.updateProjectionMatrix();
    }
    
    
    setupOrbitCont(){
        // Restricciones de zoom
        this.controls.minDistance = 0.2;    // Mínima distancia de zoom 
        this.controls.maxDistance = 0.28;   // Máxima distancia de zoom 

        // Restricciones verticales (para evitar que la cámara vaya completamente arriba o abajo)
        this.controls.minPolarAngle = THREE.Math.degToRad(50); // Min angle 
        this.controls.maxPolarAngle = THREE.Math.degToRad(110); // Max angle 

        this.controls.update();
    }
    
    setEnvironment(){
        const loader = new RGBELoader();
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
         
        loader.load( '../assets/hdr/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          this.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( `An error occurred setting the environment ${err.message}`);
        } );
    }

    
    onMouseClick(event) {
        event.preventDefault();
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
    
        // calcula objetos que intersectan el picking ray
        const intersects = this.raycaster.intersectObjects(this.pieces);
    
        for (let i = 0; i < intersects.length; i++) {
            // Aquí puedes especificar qué hacer cuando se selecciona una pieza. 
            // Por ejemplo, redirigir a otra parte de la página:
            if (intersects[i].object === this.pieces[0]) {
                document.getElementById("section1").scrollIntoView();  // scroll hacia la sección 1
            } else if (intersects[i].object === this.pieces[2]) {
                document.getElementById("section2").scrollIntoView();  // scroll hacia la sección 2
            } else if (intersects[i].object === this.pieces[1]) {
                document.getElementById("section3").scrollIntoView();  // scroll hacia la sección 2
            }
            // ... y así sucesivamente para otras piezas
        }
    }
    
    
    loadGLTF(){
        const loader = new GLTFLoader().setPath('../assets/');
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('../libs/three140/examples/js/libs/draco/');
        loader.setDRACOLoader( dracoLoader);

        loader.load(
            'model1.glb',
            gltf => {
                this.scam = gltf.scene;
                this.scene.add( gltf.scene);
                this.scam.scale.set(0.002, 0.002, 0.002); // Cambia estos valores a la escala que desees
                //this.scam.color.set(0xff0000);
                this.loadingBar.visible = false;
                this.renderer.setAnimationLoop(this.render.bind(this));

                // Calculemos el centro del cuadro delimitador y utilicemos ese valor para trasladar el modelo al origen
                const bbox = new THREE.Box3().setFromObject(gltf.scene);
                const center = new THREE.Vector3();
                bbox.getCenter(center);
                gltf.scene.position.sub(center); // Centramos el modelo

            },
            xhr => {
                this.loadingBar.progress = (xhr.loaded / xhr.total);
            },
            err => {
                console.error( err );
            }

        )
    }
    loadGLTF2(){
        const loader = new GLTFLoader().setPath('../assets/');
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('../libs/three140/examples/js/libs/draco/');
        loader.setDRACOLoader( dracoLoader);
        

        loader.load(
            'CameraTest2.glb',
            gltf => {
                console.log(gltf.scene); // Imprimimos la escena para inspeccionar la estructura.
                this.scam2 = gltf.scene;
                this.scene.add(gltf.scene);
                this.scam2.scale.set(0.002, 0.002, 0.002); // Cambia estos valores a la escala que desee.
                this.scam2.rotation.y = -Math.PI/2;
                this.loadingBar.visible = false;
                this.renderer.setAnimationLoop(this.render.bind(this));

                // Calculemos el centro del cuadro delimitador y utilicemos ese valor para trasladar el modelo al origen
                const bbox = new THREE.Box3().setFromObject(gltf.scene);
                const center = new THREE.Vector3();
                bbox.getCenter(center);
                gltf.scene.position.sub(center); // Centramos el modelo
                //this.scam2.position.set(0,0,0);
                
                // Encuentra y almacena las piezas individuales
                this.scam2.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                      this.pieces.push(child);
                      console.log(this.pieces);
                    }
                });

                this.pieces.forEach((piece, index) => {
                    const material = new THREE.MeshStandardMaterial({
                        metalness: 0.9, // Ajuste entre 0 y 1 para controlar el aspecto metálico
                        roughness: 0.7  // Ajuste entre 0 y 1 para controlar la rugosidad
                    });
                    piece.material = material; // Asigna el nuevo material a esta pieza
                    
                    // Aquí puedes asignar un color diferente a cada pieza basándote en su índice
                    switch (index) {
                        case 0: material.color.set(0x012b09); break; // pcb 
                        case 1: material.color.set(0x606060); break;  // procesador
                        case 2: material.color.set(0x202020); break;  // conector
                        case 3: material.color.set(0x065506); break;  // cam_conector  0x32314e
                        case 4: material.color.set(0x333333); break;  // lente
                        case 5: material.color.set(0xb5b5b5); break;  // cam_soporte  0x212121
                        case 6: material.color.set(0x858585); break;  // bottom
                        case 7: material.color.set(0x0000ff); break; // case
                    }
                });

            },
            xhr => {
                this.loadingBar.progress = (xhr.loaded / xhr.total);
            },
            err => {
                console.error( err );
            }

        )
    }

    explodeView() {
        // Aquí puedes aplicar las transformaciones necesarias.
        this.pieces.forEach((piece) => {
            piece.position.x += piece.position.x * 0.1;
            piece.position.y += piece.position.y * 0.1;
            piece.position.z += piece.position.z * 0.1;
        });
    }   

    resize(){
        const container = document.getElementById('animation-container');
        this.camera.aspect = container.offsetWidth / container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    }
    
    /*
    pieces[0] -> case
    pieces[1] -> base
    pieces[2] -> pcb
    pieces[3] -> camera

    pieces[0] -> pcb
    pieces[1] -> procesador
    pieces[2] -> conector
    pieces[3] -> cam_conector
    pieces[4] -> lente
    pieces[5] -> cam_soporte
    pieces[6] -> base
    pieces[7] -> case

    */

    render() {
        if (this.pause) return;
    
        // Asegurarse de que las piezas están definidas antes de acceder a ellas
        if (this.pieces && this.pieces.length > 0) {
            let moveSpeed = 0.4;  // Velocidad base de movimiento
    
            if (this.transitionTime > 0) {
                // Reducir la velocidad de movimiento a una fracción muy pequeña si estamos en la fase de transición
                moveSpeed *= 0.005;  // Aquí, el movimiento será sólo el 0.5% de la velocidad base, pero puedes ajustar este valor como quieras
                this.transitionTime--;  // Decrementar el contador de tiempo de transición
            }
    
            if (this.moveOut) {
                if (this.pieces[6].position.y > -30) {
                    this.pieces[6].position.y -= moveSpeed;
                } else if (this.pieces[3].position.x > -30) {
                    this.pieces[3].position.x -= moveSpeed;
                    this.pieces[4].position.x -= moveSpeed;
                    this.pieces[5].position.x -= moveSpeed;
                } else if (this.pieces[7].position.y < 40) {
                    this.pieces[7].position.y += moveSpeed;
                } else {
                    // Establecer el tiempo de transición cuando cambiamos de estado
                    this.transitionTime = 100;  // Aquí, por ejemplo, 100 frames 
                    this.moveOut = false;
                }
            } else {
                if (this.pieces[7].position.y > 15.7) {
                    this.pieces[7].position.y -= moveSpeed;
                } else if (this.pieces[3].position.x < 0) {
                    this.pieces[3].position.x += moveSpeed;
                    this.pieces[4].position.x += moveSpeed;
                    this.pieces[5].position.x += moveSpeed;
                } else if (this.pieces[6].position.y < 4) {
                    this.pieces[6].position.y += moveSpeed * 0.4;  // Reducir un poco la velocidad de esta pieza
                } else {
                    // Establecer el tiempo de transición cuando cambiamos de estado
                    this.transitionTime = 100;  // Nuevamente, 100 frames de transición
                    this.moveOut = true;
                }
            }
        }
        this.raycaster.setFromCamera(this.mouse, this.camera);

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    
}

export { App };