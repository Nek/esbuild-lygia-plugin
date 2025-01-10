import * as THREE from 'three';

// Import shaders
import fragmentShader from '../shaders/fragment.glsl';
import vertexShader from '../shaders/vertex.glsl';

// Setup Three.js
const canvas = document.getElementById('canvas');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(800, 800);

// Create a plane with our shader
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  glslVersion: THREE.GLSL3,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.z = 1;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Cleanup on window unload
window.addEventListener('unload', () => {
  geometry.dispose();
  material.dispose();
  renderer.dispose();
});
