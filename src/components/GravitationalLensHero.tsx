/**
 * Gravitational Lens — Original Formation (v2)
 * Luminous accretion disk with orbital rings, particle streams, and dark void.
 * Visible solid geometry + particle system. Japanese noir aesthetic.
 * Pattern C: useEffect + useRef + vanilla Three.js (NOT iframe).
 */
import { useEffect, useRef, useState } from 'react';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Clock, Color,
  DoubleSide, Fog, Group, Line, LineBasicMaterial,
  Mesh, MeshBasicMaterial, PerspectiveCamera, Points,
  RingGeometry, Scene, ShaderMaterial, SphereGeometry,
  TorusGeometry, Vector2, WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const PAL = { base: '#8a9e8f', bright: '#a3b5a8', dim: '#0c1220', glow: '#b8cab8' };
const PARTICLE_COUNT = 500;

function canUseWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch { return false; }
}

function CSSFallback() {
  return (
    <div className="absolute inset-0" style={{ zIndex: 0, background: '#080e1a', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '55%', left: '50%', width: '50vw', height: '20vw',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse, rgba(138,158,143,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
      {[1,2,3].map(i => (
        <div key={i} style={{
          position: 'absolute', top: '55%', left: '50%',
          width: `${20 + i * 12}vw`, height: `${8 + i * 5}vw`,
          transform: 'translate(-50%, -50%)',
          border: `1px solid rgba(138,158,143,${0.08 - i * 0.02})`,
          borderRadius: '50%',
          animation: `pulse${i} ${3 + i}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`
        @keyframes pulse1 { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes pulse2 { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes pulse3 { 0%,100%{opacity:0.2} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}

/** Create an elliptical orbital ring as a Line */
function makeOrbitalRing(radiusX: number, radiusZ: number, y: number, segments: number) {
  const pts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * radiusX, y, Math.sin(a) * radiusZ);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3));
  return geo;
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

    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Scene
    const scene = new Scene();
    scene.fog = new Fog(new Color(PAL.dim).getHex(), 18, 40);

    const camera = new PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 6, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(new Color(PAL.dim).getHex(), 1);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';

    // Post-processing -- strong bloom for glow
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new Vector2(container.clientWidth, container.clientHeight),
      1.2, 0.4, 0.3
    );
    composer.addPass(bloom);

    // =========================================
    // 1. ACCRETION DISK -- glowing torus ring
    // =========================================
    const diskGroup = new Group();

    // Main accretion torus -- flat, wide, luminous
    const torusGeo = new TorusGeometry(5, 0.15, 16, 100);
    const torusMat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(PAL.bright) },
        uGlow: { value: new Color(PAL.glow) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vAngle;
        void main() {
          vUv = uv;
          vAngle = atan(position.z, position.x);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uGlow;
        varying vec2 vUv;
        varying float vAngle;
        void main() {
          float pulse = 0.6 + 0.4 * sin(vAngle * 3.0 - uTime * 2.0);
          float edge = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
          vec3 col = mix(uColor, uGlow, pulse * 0.5);
          float alpha = pulse * edge * 0.7;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    });
    const mainTorus = new Mesh(torusGeo, torusMat);
    mainTorus.rotation.x = Math.PI * 0.5;
    diskGroup.add(mainTorus);

    // Inner bright ring
    const innerTorusGeo = new TorusGeometry(2.8, 0.08, 12, 80);
    const innerTorusMat = new MeshBasicMaterial({
      color: new Color(PAL.glow),
      transparent: true, opacity: 0.5, blending: AdditiveBlending,
      side: DoubleSide,
    });
    const innerTorus = new Mesh(innerTorusGeo, innerTorusMat);
    innerTorus.rotation.x = Math.PI * 0.5;
    diskGroup.add(innerTorus);

    // Outer faint ring
    const outerTorusGeo = new TorusGeometry(7.5, 0.06, 12, 100);
    const outerTorusMat = new MeshBasicMaterial({
      color: new Color(PAL.base),
      transparent: true, opacity: 0.25, blending: AdditiveBlending,
      side: DoubleSide,
    });
    const outerTorus = new Mesh(outerTorusGeo, outerTorusMat);
    outerTorus.rotation.x = Math.PI * 0.5;
    diskGroup.add(outerTorus);

    scene.add(diskGroup);

    // =========================================
    // 2. ORBITAL ARC LINES -- visible structure
    // =========================================
    const arcGroup = new Group();
    const RING_COUNT = 8;
    const ringLines: Line[] = [];

    for (let i = 0; i < RING_COUNT; i++) {
      const rx = 3.5 + i * 0.8 + Math.sin(i * 1.7) * 0.5;
      const rz = 3.0 + i * 0.6 + Math.cos(i * 2.1) * 0.4;
      const y = (Math.sin(i * 1.3) * 0.3);
      const geo = makeOrbitalRing(rx, rz, y, 120);
      const opacity = 0.12 + (i % 3) * 0.06;
      const mat = new LineBasicMaterial({
        color: new Color(PAL.base),
        transparent: true, opacity,
        blending: AdditiveBlending,
      });
      const line = new Line(geo, mat);
      // Slight tilt per ring for depth
      line.rotation.x = Math.PI * 0.48 + (i - RING_COUNT / 2) * 0.03;
      line.rotation.z = (i - RING_COUNT / 2) * 0.02;
      arcGroup.add(line);
      ringLines.push(line);
    }
    scene.add(arcGroup);

    // =========================================
    // 3. FLAT DISK GLOW -- radial gradient mesh
    // =========================================
    const diskGlowGeo = new RingGeometry(1.0, 8, 64, 1);
    const diskGlowMat = new ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(PAL.base) },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDist;
        void main() {
          vUv = uv;
          vDist = length(position.xz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying float vDist;
        void main() {
          float fade = smoothstep(8.0, 2.0, vDist) * smoothstep(0.8, 1.5, vDist);
          float flicker = 0.8 + 0.2 * sin(vDist * 4.0 - uTime * 1.5);
          gl_FragColor = vec4(uColor, fade * flicker * 0.15);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    });
    const diskGlow = new Mesh(diskGlowGeo, diskGlowMat);
    diskGlow.rotation.x = -Math.PI * 0.5;
    scene.add(diskGlow);

    // =========================================
    // 4. PARTICLES -- orbiting points
    // =========================================
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 7;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      const speed = 1.5 + Math.random() * 2.5;
      velocities[i * 3] = -Math.sin(angle) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
      velocities[i * 3 + 2] = Math.cos(angle) * speed;
    }

    const pGeo = new BufferGeometry();
    pGeo.setAttribute('position', new BufferAttribute(positions, 3));

    const pMat = new ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(PAL.bright) },
        uGlow: { value: new Color(PAL.glow) },
      },
      vertexShader: `
        varying float vDist;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vDist = length(position.xz);
          gl_PointSize = max(2.5, 8.0 / -mvPos.z * (1.0 + 2.0 / max(vDist, 1.0)));
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uGlow;
        varying float vDist;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          float alpha = (1.0 - d * d) * 0.9;
          // Brighter near center
          vec3 col = mix(uGlow, uColor, smoothstep(1.5, 5.0, vDist));
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const points = new Points(pGeo, pMat);
    scene.add(points);

    // =========================================
    // 5. DARK VOID -- central black sphere + halo
    // =========================================
    const voidGeo = new SphereGeometry(0.6, 32, 32);
    const voidMat = new MeshBasicMaterial({ color: 0x000000 });
    const voidSphere = new Mesh(voidGeo, voidMat);
    scene.add(voidSphere);

    // Sage halo around void
    const haloGeo = new SphereGeometry(0.9, 32, 32);
    const haloMat = new MeshBasicMaterial({
      color: new Color(PAL.base),
      transparent: true, opacity: 0.08,
      blending: AdditiveBlending,
    });
    const halo = new Mesh(haloGeo, haloMat);
    scene.add(halo);

    // =========================================
    // ANIMATE
    // =========================================
    let cameraAngle = 0;
    const clock = new Clock();
    let animId: number;

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isVisibleRef.current) return;
      if (isMobile && ++frameCount % 2 !== 0) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Rotate disk group slowly
      diskGroup.rotation.y += dt * 0.15;

      // Rotate arc lines at different speeds
      for (let i = 0; i < ringLines.length; i++) {
        ringLines[i].rotation.y += dt * (0.05 + i * 0.012);
      }

      // Disk glow animation
      diskGlowMat.uniforms.uTime.value = time;
      diskGlow.rotation.y += dt * 0.08;

      // Torus shader time
      torusMat.uniforms.uTime.value = time;

      // Halo pulse
      haloMat.opacity = 0.06 + Math.sin(time * 1.2) * 0.03;
      halo.scale.setScalar(1 + Math.sin(time * 0.8) * 0.1);

      // Update particles -- gravity simulation
      const pos = pGeo.attributes.position as BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const x = arr[ix], y = arr[ix + 1], z = arr[ix + 2];
        const dist = Math.sqrt(x * x + z * z);

        // Respawn if too close or too far
        if (dist < 0.8 || dist > 12) {
          const angle = Math.random() * Math.PI * 2;
          const r = 2 + Math.random() * 7;
          arr[ix] = Math.cos(angle) * r;
          arr[ix + 1] = (Math.random() - 0.5) * 0.8;
          arr[ix + 2] = Math.sin(angle) * r;
          const speed = 1.5 + Math.random() * 2.5;
          velocities[ix] = -Math.sin(angle) * speed;
          velocities[ix + 1] = (Math.random() - 0.5) * 0.1;
          velocities[ix + 2] = Math.cos(angle) * speed;
          continue;
        }

        // Gravity toward center (xz plane)
        const invDist = 1.0 / Math.max(dist, 0.5);
        const gForce = 6.0 * invDist * invDist;
        velocities[ix] -= x * invDist * gForce * dt;
        velocities[ix + 2] -= z * invDist * gForce * dt;
        // Flatten to disk plane
        velocities[ix + 1] -= y * 2.0 * dt;
        // Damping
        velocities[ix] *= 0.998;
        velocities[ix + 1] *= 0.99;
        velocities[ix + 2] *= 0.998;

        arr[ix] += velocities[ix] * dt;
        arr[ix + 1] += velocities[ix + 1] * dt;
        arr[ix + 2] += velocities[ix + 2] * dt;
      }
      pos.needsUpdate = true;

      // Camera orbit
      cameraAngle += dt * 0.08;
      camera.position.x = Math.sin(cameraAngle) * 16;
      camera.position.z = Math.cos(cameraAngle) * 16;
      camera.position.y = 6 + Math.sin(cameraAngle * 0.3) * 1.5;
      camera.lookAt(0, 0, 0);

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
      pGeo.dispose();
      pMat.dispose();
      voidGeo.dispose();
      voidMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      innerTorusGeo.dispose();
      innerTorusMat.dispose();
      outerTorusGeo.dispose();
      outerTorusMat.dispose();
      diskGlowGeo.dispose();
      diskGlowMat.dispose();
      ringLines.forEach(l => { l.geometry.dispose(); (l.material as LineBasicMaterial).dispose(); });
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [webgl]);

  if (!webgl) return <CSSFallback />;
  return <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 0 }} />;
}
