import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvas3DProps {
  className?: string;
}

export const ThreeCanvas3D: React.FC<ThreeCanvas3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 2. 3D Wireframe Geospatial Earth / Orbital Sphere
    const sphereRadius = 7.5;
    const sphereGeometry = new THREE.IcosahedronGeometry(sphereRadius, 3);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globe.position.set(10, -1, -2);
    scene.add(globe);

    // 3. Orbital Rings (Sentinel-1 and Sentinel-2 Orbits)
    const ring1Geometry = new THREE.RingGeometry(9.5, 9.55, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const orbitRing1 = new THREE.Mesh(ring1Geometry, ringMaterial);
    orbitRing1.rotation.x = Math.PI / 2.8;
    orbitRing1.rotation.y = Math.PI / 6;
    orbitRing1.position.copy(globe.position);
    scene.add(orbitRing1);

    const ring2Geometry = new THREE.RingGeometry(11.2, 11.25, 64);
    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
    });
    const orbitRing2 = new THREE.Mesh(ring2Geometry, ringMaterial2);
    orbitRing2.rotation.x = Math.PI / 1.8;
    orbitRing2.rotation.z = Math.PI / 4;
    orbitRing2.position.copy(globe.position);
    scene.add(orbitRing2);

    // 4. Satellite Beacon
    const satGeometry = new THREE.SphereGeometry(0.22, 16, 16);
    const satMaterial = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const satellite = new THREE.Mesh(satGeometry, satMaterial);
    scene.add(satellite);

    // 5. Floating Geospatial Particle Constellation
    const particleCount = 280;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 45;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 20;
      scales[i / 3] = Math.random() * 0.8 + 0.2;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x5eead4,
      size: 0.12,
      transparent: true,
      opacity: 0.45,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      targetX += (mouseX * 0.5 - targetX) * 0.05;
      targetY += (mouseY * 0.5 - targetY) * 0.05;

      // Rotate Globe & Orbits
      globe.rotation.y = elapsedTime * 0.12 + targetX;
      globe.rotation.x = 0.2 + targetY * 0.3;

      orbitRing1.rotation.z = elapsedTime * 0.08;
      orbitRing2.rotation.z = -elapsedTime * 0.06;

      // Animate Satellite in Orbit
      const orbitSpeed = elapsedTime * 0.6;
      const r = 9.5;
      satellite.position.x = globe.position.x + Math.cos(orbitSpeed) * r;
      satellite.position.y = globe.position.y + Math.sin(orbitSpeed) * Math.sin(Math.PI / 2.8) * r;
      satellite.position.z = globe.position.z + Math.sin(orbitSpeed) * Math.cos(Math.PI / 2.8) * r;

      // Particle Drift
      particleSystem.rotation.y = elapsedTime * 0.02;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.03) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    />
  );
};

