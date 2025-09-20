// src/background.js - Enhanced Space Simulation Background
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CONFIG = {
  // Inferno Theme Colors (matching racing game aesthetic)
  STAR_COLOR_1: 0xffffff,    // Pure white
  STAR_COLOR_2: 0xffcc00,    // Golden yellow
  PLANET_BASE_COLOR: [0.8, 0.2, 0.1],    // Red-orange
  PLANET_ACCENT_COLOR: [1, 0.6, 0.2],    // Bright orange
  TRAIL_COLOR: 0xff4400,     // Red-orange trail

  // Scene Configuration
  SKYDOME_RADIUS: 1000,
  CAMERA_POSITION: { x: 20, y: 50, z: 40 },

  // Star Configuration
  STAR_RADIUS: 2.2,
  STAR_INTENSITY: 1.0,

  // Planet Configuration
  PLANET_COUNT: 3,
  PLANET_DATA: [
    { size: 0.6, distance: 8, speed: 0.6, geometry: 'octahedron' },
    { size: 0.9, distance: 14, speed: 0.35, geometry: 'dodecahedron' },
    { size: 0.7, distance: 22, speed: 0.25, geometry: 'icosahedron' }
  ],

  // Enhanced Starfield Layers
  STARFIELD_LAYERS: [
    { count: 3000, distance: [600, 1000], size: [0.8, 1.5], color: 0x6688bb },
    { count: 2000, distance: [1000, 1500], size: [1, 2], color: 0x88aadd },
    { count: 1000, distance: [1500, 2000], size: [1.5, 3], color: 0xaaccff }
  ],

  // Lighting
  AMBIENT_LIGHT_COLOR: 0x401008,
  AMBIENT_LIGHT_INTENSITY: 0.8,
  STAR_LIGHT_INTENSITY: 3,
  DIRECTIONAL_LIGHT_1: { color: 0xff6600, intensity: 0.5 },
  DIRECTIONAL_LIGHT_2: { color: 0xdd3300, intensity: 0.3 },

  // Materials
  METAL_COLOR: 0x332222,
  RING_COLOR: 0xff8866,

  // Animation
  TIME_ACCELERATION: 1.0,
};

// Custom Shader Materials
const STAR_VERTEX_SHADER = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
void main(){
    vPosition=position;
    vNormal=normal;
    vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}
`;

const STAR_FRAGMENT_SHADER = `
uniform float time;
uniform float intensity;
uniform vec3 color1;
uniform vec3 color2;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
float noise(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,54.53)))*43758.5453);}
void main(){
    vec3 pos=vPosition+time*0.1;
    float n1=noise(pos*3.0);
    float n2=noise(pos*6.0+vec3(100.0));
    float n3=noise(pos*12.0+vec3(200.0));
    float pattern=n1*0.5+n2*0.3+n3*0.2;
    pattern=pow(pattern,2.0);
    vec3 finalColor=mix(color1,color2,pattern);
    finalColor*=(1.0+intensity*pattern*2.0);
    float fresnel=pow(1.0-dot(vNormal,vec3(0.0,0.0,1.0)),2.0);
    finalColor+=fresnel*intensity*0.5;
    gl_FragColor=vec4(finalColor,1.0);
}
`;

const PLANET_VERTEX_SHADER = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
void main(){
    vPosition=position;
    vNormal=normalize(normalMatrix*normal);
    vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}
`;

const PLANET_FRAGMENT_SHADER = `
uniform float time;
uniform vec3 baseColor;
uniform vec3 accentColor;
uniform float energy;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
    vec2 uv=vUv+time*0.02;
    float n1=noise(uv*8.0);
    float n2=noise(uv*16.0);
    float pattern=n1*0.7+n2*0.3;
    vec3 color=mix(baseColor,accentColor,pattern);
    float fresnel=pow(1.0-abs(dot(vNormal,vec3(0.0,0.0,1.0))),1.5);
    color+=fresnel*accentColor*0.5;
    color*=(1.0+energy*0.8);
    gl_FragColor=vec4(color,1.0);
}
`;

const BackgroundScene = forwardRef(function BackgroundScene(_, ref) {
  const mountRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const orreryRef = useRef(null);
  const starRef = useRef(null);
  const planetsRef = useRef([]);
  const particleSystemsRef = useRef([]);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);

  // Zoom-out animation state (for transition into gameplay)
  const zoomActiveRef = useRef(false);
  const zoomStartRef = useRef(0);
  const zoomDurationRef = useRef(600); // ms
  const zoomCallbackRef = useRef(null);
  const camStartZRef = useRef(0);
  const camTargetZRef = useRef(0);

  // References to composer passes we may animate
  const bloomPassRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    cameraRef.current = camera;
    camera.position.set(CONFIG.CAMERA_POSITION.x, CONFIG.CAMERA_POSITION.y, CONFIG.CAMERA_POSITION.z);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

    // Setup Camera Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;
    controls.minDistance = 8;
    controls.maxDistance = 150;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.15;
    controls.enablePan = false;

    // Setup Post-Processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6, 0.5, 0.15
    );
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;
    composer.addPass(new OutputPass());

    // Enhanced Lighting Setup
    const ambientLight = new THREE.AmbientLight(CONFIG.AMBIENT_LIGHT_COLOR, CONFIG.AMBIENT_LIGHT_INTENSITY);
    scene.add(ambientLight);

    const starLight = new THREE.PointLight(0xffcc88, CONFIG.STAR_LIGHT_INTENSITY, 120, 1.8);
    starLight.castShadow = true;
    starLight.shadow.mapSize.width = 2048;
    starLight.shadow.mapSize.height = 2048;
    scene.add(starLight);

    const blueLight = new THREE.DirectionalLight(CONFIG.DIRECTIONAL_LIGHT_1.color, CONFIG.DIRECTIONAL_LIGHT_1.intensity);
    blueLight.position.set(-50, 30, -30);
    scene.add(blueLight);

    const purpleLight = new THREE.DirectionalLight(CONFIG.DIRECTIONAL_LIGHT_2.color, CONFIG.DIRECTIONAL_LIGHT_2.intensity);
    purpleLight.position.set(30, -20, 50);
    scene.add(purpleLight);

    // Create Orrery System
    const orrery = new THREE.Group();
    orreryRef.current = orrery;
    scene.add(orrery);

    // Materials
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.METAL_COLOR,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0x1a2540,
      emissiveIntensity: 0.4,
      envMapIntensity: 1.5
    });

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: CONFIG.RING_COLOR,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });

    // Create Central Star
    const starGeometry = new THREE.IcosahedronGeometry(CONFIG.STAR_RADIUS, 2);
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: CONFIG.STAR_INTENSITY },
        color1: { value: new THREE.Color(CONFIG.STAR_COLOR_1) },
        color2: { value: new THREE.Color(CONFIG.STAR_COLOR_2) }
      },
      vertexShader: STAR_VERTEX_SHADER,
      fragmentShader: STAR_FRAGMENT_SHADER
    });

    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.castShadow = false;
    star.receiveShadow = false;
    starRef.current = star;
    orrery.add(star);

    // Create Metal Gears
    for (let i = 0; i < 7; i++) {
      const gearGeometry = new THREE.TorusGeometry(2.8 + i * 0.5, 0.18, 12, 64);
      const gear = new THREE.Mesh(gearGeometry, metalMaterial);
      gear.rotation.x = Math.PI / 2;
      gear.position.y = -2 - i * 0.25;
      gear.userData.rotationSpeed = (i % 2 === 0 ? 1 : -1) * (0.08 + i * 0.04);
      gear.castShadow = true;
      gear.receiveShadow = true;
      orrery.add(gear);
    }

    // Create Planets
    const planetGeometries = [
      new THREE.OctahedronGeometry(0.6, 1),
      new THREE.DodecahedronGeometry(0.9, 1),
      new THREE.IcosahedronGeometry(0.7, 1)
    ];

    CONFIG.PLANET_DATA.forEach((data, i) => {
      const planetGroup = new THREE.Group();
      planetGroup.userData.orbitSpeed = data.speed;
      planetGroup.rotation.y = Math.random() * Math.PI * 2;
      orrery.add(planetGroup);

      // Orbit Ring
      const ringGeometry = new THREE.TorusGeometry(data.distance, 0.08, 20, 128);
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      planetGroup.add(ring);

      // Planet
      const planetMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          baseColor: { value: new THREE.Vector3(...CONFIG.PLANET_BASE_COLOR) },
          accentColor: { value: new THREE.Vector3(...CONFIG.PLANET_ACCENT_COLOR) },
          energy: { value: 0 }
        },
        vertexShader: PLANET_VERTEX_SHADER,
        fragmentShader: PLANET_FRAGMENT_SHADER
      });

      const planet = new THREE.Mesh(planetGeometries[i], planetMaterial);
      planet.position.x = data.distance;
      planet.userData.selfRotation = 0.6;
      planet.castShadow = true;
      planet.receiveShadow = true;
      planetGroup.add(planet);

      // Create Particle Trail
      createParticleTrail(planet, CONFIG.TRAIL_COLOR, data.distance);

      planetsRef.current.push({ group: planetGroup, body: planet, material: planetMaterial });
    });

    // Create Enhanced Starfield
    CONFIG.STARFIELD_LAYERS.forEach(layer => {
      const positions = new Float32Array(layer.count * 3);
      const colors = new Float32Array(layer.count * 3);
      const sizes = new Float32Array(layer.count);

      const c = new THREE.Color(layer.color);

      for (let i = 0; i < layer.count; i++) {
        const u = Math.random(), v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = layer.distance[0] + Math.random() * (layer.distance[1] - layer.distance[0]);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        sizes[i] = layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
      });

      const stars = new THREE.Points(geometry, material);
      scene.add(stars);
    });

    // Animation Loop using requestAnimationFrame so we can cancel on unmount
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta() * CONFIG.TIME_ACCELERATION;
      const elapsed = clockRef.current.getElapsedTime();

      // Animate Star
      if (starRef.current) {
        starRef.current.rotation.y += delta * 0.3;
        starRef.current.rotation.x += delta * 0.15;
        starRef.current.material.uniforms.time.value = elapsed;
      }

      // Animate Gears
      orreryRef.current.children.forEach(child => {
        if (child.userData.rotationSpeed) {
          child.rotation.z += delta * child.userData.rotationSpeed;
        }
      });

      // Animate Planets
      planetsRef.current.forEach(planet => {
        planet.group.rotation.y += delta * planet.group.userData.orbitSpeed;
        planet.body.rotation.y += delta * planet.body.userData.selfRotation;
        planet.body.rotation.z += delta * planet.body.userData.selfRotation * 0.3;
        planet.material.uniforms.time.value = elapsed;
      });

      // Update Particle Systems
      particleSystemsRef.current.forEach(system => {
        system.system.geometry.attributes.position.needsUpdate = true;
      });

      // Zoom-out animation
      if (zoomActiveRef.current) {
        const now = performance.now();
        const t = Math.min(1, (now - zoomStartRef.current) / zoomDurationRef.current);
        // Ease in-out quad
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        camera.position.z = THREE.MathUtils.lerp(camStartZRef.current, camTargetZRef.current, ease);
        // Slight increase in bloom for effect
        if (bloomPassRef.current) {
          bloomPassRef.current.strength = 0.6 + 0.4 * t;
        }
        if (t >= 1) {
          zoomActiveRef.current = false;
          if (typeof zoomCallbackRef.current === 'function') {
            const cb = zoomCallbackRef.current;
            zoomCallbackRef.current = null;
            cb();
          }
        }
      }

      // Update Camera Controls
      controls.update();

      composer.render(delta);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      // Stop animation loop
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  // Expose zoomOut method to parent (must be outside effects)
  useImperativeHandle(ref, () => ({
    zoomOut: (cb, distance = 35, durationMs = 600) => {
      const camera = cameraRef.current;
      if (!camera) {
        if (typeof cb === 'function') cb();
        return;
      }
      zoomActiveRef.current = true;
      zoomStartRef.current = performance.now();
      zoomDurationRef.current = durationMs;
      camStartZRef.current = camera.position.z;
      camTargetZRef.current = camera.position.z + distance;
      zoomCallbackRef.current = cb;
    }
  }));

  // Helper function to create particle trails
  function createParticleTrail(planet, color, radius) {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const c = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    planet.parent.add(points);
    particleSystemsRef.current.push({ system: points, planet: planet, positions: positions, radius: radius });
  }

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />;
});

// Expose imperative zoomOut API
BackgroundScene.displayName = 'BackgroundScene';

export default BackgroundScene;
