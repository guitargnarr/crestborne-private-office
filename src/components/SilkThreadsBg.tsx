/**
 * Silk Threads — Original Formation
 * Thin luminous curves flowing in parallel like draped silk fabric.
 * Subtle sine-wave ripple patterns. Meditative, slow animation.
 * Pattern C: useEffect + useRef + vanilla Three.js (NOT iframe).
 */
import { useEffect, useRef, useState } from 'react';
import {
  BufferAttribute, BufferGeometry, Clock, Color, Fog, Line,
  LineBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer,
} from 'three';

const PAL = { base: '#8a9e8f', bright: '#a3b5a8', dim: '#0c1220', spot2: '#131b2e' };
const LINE_COUNT = 50;
const POINTS_PER_LINE = 100;
const TIME_SCALE = 0.15;

function canUseWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch { return false; }
}

function CSSFallbackBg() {
  const lines = Array.from({ length: 12 }, (_, i) => ({
    y: 10 + (i / 11) * 80,
    delay: i * 0.3,
    opacity: 0.04 + (Math.sin(i * 0.8) * 0.5 + 0.5) * 0.08,
  }));
  return (
    <div className="absolute inset-0" style={{ zIndex: 0, background: '#080e1a', overflow: 'hidden' }}>
      {lines.map((l, i) => (
        <div key={i} style={{
          position: 'absolute', left: '5%', right: '5%',
          top: `${l.y}%`, height: '1px',
          background: `linear-gradient(90deg, transparent, ${PAL.base}, transparent)`,
          opacity: l.opacity,
          animation: `fadeIn 3s ease ${l.delay}s both`,
        }} />
      ))}
    </div>
  );
}

export default function SilkThreadsBg() {
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

    const scene = new Scene();
    scene.fog = new Fog(new Color(PAL.dim).getHex(), 5, 18);

    const camera = new PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(new Color('#080e1a').getHex(), 1);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';

    // Create silk threads
    const lines: { line: Line; geometry: BufferGeometry; phaseOffset: number; freq: number; amplitude: number; baseY: number }[] = [];
    const baseColor = new Color(PAL.base);

    for (let i = 0; i < LINE_COUNT; i++) {
      const t = i / (LINE_COUNT - 1);
      const positions = new Float32Array(POINTS_PER_LINE * 3);
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(positions, 3));

      const opacity = 0.03 + Math.sin(t * Math.PI) * 0.15;
      const material = new LineBasicMaterial({
        color: baseColor.clone().lerp(new Color(PAL.bright), t * 0.3),
        transparent: true,
        opacity,
      });

      const line = new Line(geometry, material);
      scene.add(line);

      lines.push({
        line,
        geometry,
        phaseOffset: t * Math.PI * 4 + Math.random() * 2,
        freq: 0.8 + Math.random() * 0.5,
        amplitude: 0.15 + Math.random() * 0.2,
        baseY: (t - 0.5) * 8,
      });
    }

    const clock = new Clock();
    let cameraAngle = 0;
    let animId: number;

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isVisibleRef.current) return;
      if (isMobile && ++frameCount % 2 !== 0) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime() * TIME_SCALE;

      for (const silk of lines) {
        const pos = silk.geometry.attributes.position as BufferAttribute;
        const arr = pos.array as Float32Array;

        for (let j = 0; j < POINTS_PER_LINE; j++) {
          const jt = j / (POINTS_PER_LINE - 1);
          const x = (jt - 0.5) * 16;
          const y = silk.baseY + Math.sin(x * silk.freq + time + silk.phaseOffset) * silk.amplitude;
          const z = -2 + Math.sin(jt * Math.PI * 0.5 + silk.phaseOffset * 0.3) * 1.5;

          arr[j * 3] = x;
          arr[j * 3 + 1] = y;
          arr[j * 3 + 2] = z;
        }
        pos.needsUpdate = true;
      }

      // Very slow camera drift
      cameraAngle += dt * 0.03;
      camera.position.x = Math.sin(cameraAngle) * 0.5;
      camera.position.y = Math.cos(cameraAngle * 0.7) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      renderer.dispose();
      for (const silk of lines) {
        silk.geometry.dispose();
        (silk.line.material as LineBasicMaterial).dispose();
      }
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [webgl]);

  if (!webgl) return <CSSFallbackBg />;
  return <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 0 }} />;
}
