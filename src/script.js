import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";


//loading
const textureLoader = new THREE.TextureLoader()
const normalTexture = textureLoader.load("/texture/moonmap.png")
const moon = textureLoader.load("/texture/cover1.jpg")

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const geometry = new THREE.SphereBufferGeometry(.8, 64, 64)
const sunEl = new THREE.SphereBufferGeometry(1, 64, 64)
// Materials

const material = new THREE.MeshStandardMaterial()
material.metalness = 1
material.roughness = 0.8
material.normalMap = normalTexture
material.map = moon
material.color = new THREE.Color(0xffffff)

const materialForSun = new THREE.MeshPhongMaterial()
materialForSun.roughness = 1
materialForSun.color = new THREE.Color(0xFDB813)
materialForSun.emissive = new THREE.Color(0xFDB813)
materialForSun.emissiveIntensity = 5


//render bloom pass



// Mesh
const sphere = new THREE.Mesh(geometry,material)
const sun = new THREE.Mesh(sunEl, materialForSun)
sun.position.z = -50
sun.position.x = -40
sun.position.y = 1

scene.add(sphere)
scene.add(sun)

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 10
pointLight.intensity = 0.07
scene.add(pointLight)

const pointLight2 = new THREE.PointLight(0xfff5c3, 0.1)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
pointLight2.position.set(-40,1,-50)
pointLight2.intensity = 0.85
scene.add(pointLight2)

gui.add(pointLight2.position, 'y').min(-300).max(3).step(0.01)
gui.add(pointLight2.position, 'x').min(-600).max(3).step(0.01)
gui.add(pointLight2.position, 'z').min(-300).max(3).step(0.01)
gui.add(pointLight2, 'intensity').min(0).max(10).step(0.01)
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const pointLightHelper = new THREE.PointLightHelper(pointLight2, 1)
scene.add(pointLightHelper)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true
//add star

function addStar(){
    let geometry = new THREE.SphereGeometry(0.08, 24, 24)
    let material = new THREE.MeshStandardMaterial({color: 0xFDB813, emissive: 0xFDB813, emissiveIntensity: 40})
    let star = new THREE.Mesh(geometry, material)
    const [x, y, z] = Array(3).fill().map(()=>THREE.MathUtils.randFloat(-150, 150))
    console.log(x,y,z)
    if(Math.abs(x) > 100 || Math.abs(y) > 100 || Math.abs(z) > 100){
        geometry = new THREE.SphereGeometry(0.3, 24, 24)
        star = new THREE.Mesh(geometry, material)
    }
    star.position.set(x,y,z)
    scene.add(star)
    scene.add(pointLight)
}
Array(500).fill().forEach(addStar)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0.6;
bloomPass.strength = 3; //intensity of glow
bloomPass.radius = 0.5;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

/**
 * Animate
 */
 let mouseX = 0 
 let mouseY = 0
 let targetX = 0
 let targetY = 0

 const windowHalfX = window.innerWidth/2
 const windowHalfY = window.innerHeight /2

 const onMouseMovement = (e) =>{
     mouseX = (e.clientX - windowHalfX)
     mouseY = (e.clientY - windowHalfY)
 }

document.addEventListener("mousemove", onMouseMovement)




const clock = new THREE.Clock()

const tick = () =>
{
    targetX = mouseX * .001
    targetY = mouseY * .001
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 2 * elapsedTime

     sphere.rotation.y += .5 * (targetX - sphere.rotation.y)
     sphere.rotation.x += .10 * (targetY - sphere.rotation.x / 2)
    //  sphere.position.z += 0.0005 * (targetX - sphere.rotation.x / 2)
    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    bloomComposer.render();
}

tick()