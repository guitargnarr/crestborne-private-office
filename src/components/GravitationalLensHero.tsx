/**
 * Gravitational Lens — Original Formation
 * 600 luminous particles warped by invisible gravitational mass at center.
 * Particles stream in curved geodesic paths around a dark void.
 * Pattern C: useEffect + useRef + vanilla Three.js (NOT iframe).
 */
import { useEffect, useRef, useState } from 'react';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Clock, Color,
  Fog, Mesh, MeshBasicMaterial, PerspectiveCamera, Points,
  RingGeometry, Scene, ShaderMaterial, SphereGeometry, Vector2,
  WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const PAL = { base: '#8a9e8f', bright: '#a3b5a8', dim: '#0c1220', spot2: '#131b2e' };
const PARTICLE_COUNT = 600;
const GRAVITY_STRENGTH = 8.0;
const MIN_RADIUS = 0.3;
const MAX_RADIUS = 12.0;
const SPAWN_RADIUS = 10.0;

function canUseWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch { return false; }
}

function CSSFallback() {
  const dots = Array.from({ length: 40 }, (_, i) => ({
    x: 15 + (Math.sin(i * 2.39) * 0.5 + 0.5) * 70,
    y: 15 + (Math.cos(i * 1.73) * 0.5 + 0.5) * 70,
    delay: (i * 0.12) % 4,
    size: 2 + (i % 5),
  }));
  return (
    <div className="absolute inset-0" style={{ zIndex: 0, background: '#080e1a', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: '40vw', height: '40vw',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(138,158,143,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
          width: d.size, height: d.size, borderRadius: '50%',
          background: '#8a9e8f',
          opacity: 0.15,
          animation: `fadeIn 2s ease ${d.delay}s both`,
        }} />
      ))}
    </div>
  );
}

export default function GravitationalLensHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webgl] = useState(() => canUseWebGL());
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (!webgl || !containerRef.current) return;
    const container = containerRef.current;
    const isMobile = window.innerWidth < 768;
    let frameCount = 0;

    // Intersection Observer -- skip rendering when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Scene
    const scene = new Scene();
    scene.fog = new Fog(new Color(PAL.dim).getHex(), 8, 20);
    const camera = new PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(new Color(PAL.dim).getHex(), 1);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new Vector2(container.clientWidth, container.clientHeight),
      0.4, 0.6, 0.7
    );
    composer.addPass(bloom);

    // Particles
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const ages = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = MIN_RADIUS + Math.random() * (SPAWN_RADIUS - MIN_RADIUS);
      const y = (Math.random() - 0.5) * 4;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      // Tangential velocity for orbital motion
      const speed = 1.5 + Math.random() * 2.0;
      velocities[i * 3] = -Math.sin(angle) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      velocities[i * 3 + 2] = Math.cos(angle) * speed;
      ages[i] = Math.random();
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));

    const particleMaterial = new ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(PAL.base) },
        uBright: { value: new Color(PAL.bright) },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying float vDist;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vDist = length(position.xz);
          gl_PointSize = max(1.5, 4.0 / -mvPos.z * (1.0 + 0.5 / max(vDist, 0.5)));
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uBright;
        varying float vDist;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          float alpha = (1.0 - d * d) * smoothstep(0.0, 2.0, vDist) * 0.7;
          vec3 col = mix(uBright, uColor, smoothstep(1.0, 5.0, vDist));
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const points = new Points(geometry, particleMaterial);
    scene.add(points);

    // Dark void center
    const voidGeo = new SphereGeometry(0.25, 32, 32);
    const voidMat = new MeshBasicMaterial({ color: 0x000000 });
    const voidSphere = new Mesh(voidGeo, voidMat);
    scene.add(voidSphere);

    // Distortion ring
    const ringGeo = new RingGeometry(0.4, 0.5, 64);
    const ringMat = new MeshBasicMaterial({
      color: new Color(PAL.base).getHex(),
      transparent: true, opacity: 0.08, side: 2,
    });
    const ring = new Mesh(ringGeo, ringMat);
    scene.add(ring);

    // Camera orbit state
    let cameraAngle = 0;
    const clock = new Clock();

    // Animate
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isVisibleRef.current) return;
      if (isMobile && ++frameCount % 2 !== 0) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Update particles -- gravity + orbital
      const pos = geometry.attributes.position as BufferAttribute;
      const arr = pos.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const x = arr[ix], y = arr[ix + 1], z = arr[ix + 2];
        const dist3d = Math.sqrt(x * x + y * y + z * z);

        if (dist3d < MIN_RADIUS || dist3d > MAX_RADIUS) {
          // Respawn at edge
          const angle = Math.random() * Math.PI * 2;
          const r = SPAWN_RADIUS * (0.7 + Math.random() * 0.3);
          arr[ix] = Math.cos(angle) * r;
          arr[ix + 1] = (Math.random() - 0.5) * 3;
          arr[ix + 2] = Math.sin(angle) * r;
          const speed = 1.5 + Math.random() * 2.0;
          velocities[ix] = -Math.sin(angle) * speed;
          velocities[ix + 1] = (Math.random() - 0.5) * 0.2;
          velocities[ix + 2] = Math.cos(angle) * speed;
          continue;
        }

        // Gravitational pull toward center
        const invDist = 1.0 / Math.max(dist3d, 0.1);
        const gForce = GRAVITY_STRENGTH * invDist * invDist;
        velocities[ix] -= (x * invDist) * gForce * dt;
        velocities[ix + 1] -= (y * invDist) * gForce * dt * 0.3;
        velocities[ix + 2] -= (z * invDist) * gForce * dt;

        // Light damping
        velocities[ix] *= 0.999;
        velocities[ix + 1] *= 0.995;
        velocities[ix + 2] *= 0.999;

        arr[ix] += velocities[ix] * dt;
        arr[ix + 1] += velocities[ix + 1] * dt;
        arr[ix + 2] += velocities[ix + 2] * dt;
      }
      pos.needsUpdate = true;

      // Pulse the ring
      ring.rotation.x = Math.PI * 0.5;
      ring.material.opacity = 0.05 + Math.sin(time * 0.8) * 0.03;

      // Camera drift
      cameraAngle += dt * 0.06;
      camera.position.x = Math.sin(cameraAngle) * 10;
      camera.position.z = Math.cos(cameraAngle) * 10;
      camera.position.y = 2 + Math.sin(cameraAngle * 0.3) * 0.8;
      camera.lookAt(0, 0, 0);

      particleMaterial.uniforms.uTime.value = time;
      composer.render();
    }
    animate();

    // Resize
    function onResize() {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      renderer.dispose();
      geometry.dispose();
      particleMaterial.dispose();
      voidGeo.dispose();
      voidMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [webgl]);

  if (!webgl) return <CSSFallback />;
  return <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 0 }} />;
}
