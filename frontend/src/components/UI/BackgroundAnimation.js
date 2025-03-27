import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';

const BackgroundAnimation = () => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Configuración de Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    
    containerRef.current.appendChild(renderer.domElement);
    
    // Posición de la cámara
    camera.position.z = 30;
    
    // Crear partículas para efecto futurista
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    const scaleArray = new Float32Array(particlesCount);
    
    // Posiciones aleatorias para las partículas
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    // Escalas aleatorias para las partículas
    for (let i = 0; i < particlesCount; i++) {
      scaleArray[i] = Math.random();
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
    
    // Material para las partículas
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x00bcd4, // Color cian futurista
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    // Crear el sistema de partículas
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Crear líneas de conexión para efecto de red
    const linesGeometry = new THREE.BufferGeometry();
    const linesCount = 100;
    const linesPositions = new Float32Array(linesCount * 6); // 2 puntos por línea, 3 coordenadas por punto
    
    for (let i = 0; i < linesCount * 6; i += 6) {
      // Punto inicial
      linesPositions[i] = (Math.random() - 0.5) * 80;
      linesPositions[i + 1] = (Math.random() - 0.5) * 80;
      linesPositions[i + 2] = (Math.random() - 0.5) * 80;
      
      // Punto final
      linesPositions[i + 3] = (Math.random() - 0.5) * 80;
      linesPositions[i + 4] = (Math.random() - 0.5) * 80;
      linesPositions[i + 5] = (Math.random() - 0.5) * 80;
    }
    
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linesPositions, 3));
    
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x7c4dff, // Color púrpura futurista
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);
    
    // Crear efecto de grilla para el suelo
    const gridHelper = new THREE.GridHelper(200, 50, 0x00bcd4, 0x00bcd4);
    gridHelper.position.y = -30;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Función de animación
    const animate = () => {
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      
      linesMesh.rotation.x += 0.0003;
      linesMesh.rotation.y += 0.0003;
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Iniciar animación
    animate();
    
    // Manejar cambios de tamaño de ventana
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      scene.remove(particlesMesh);
      scene.remove(linesMesh);
      scene.remove(gridHelper);
      
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
    };
  }, []);
  
  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default BackgroundAnimation;
