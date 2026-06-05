'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useTelemetryStore } from '@/lib/store/useTelemetryStore';

export default function TwinCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 450;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    containerRef.current.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 3;
    controls.maxDistance = 25;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 15, 8);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.5);
    dirLight2.position.set(-8, 5, -8);
    scene.add(dirLight2);

    // --- Grid Floor ---
    const gridHelper = new THREE.GridHelper(30, 30, 0x334155, 0x1e293b);
    gridHelper.position.y = -2.1;
    scene.add(gridHelper);

    // --- Assembly Group ---
    const assemblyGroup = new THREE.Group();
    assemblyGroup.position.set(0, -2, 0); // Ground aligned at Y = -2
    scene.add(assemblyGroup);

    // Common materials & shapes
    const lidMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
    const tankShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.4,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // ==========================================
    // TANK A: SOURCE VESSEL (Left, X = -2.5)
    // ==========================================
    const tankAGroup = new THREE.Group();
    tankAGroup.position.x = -2.5;
    assemblyGroup.add(tankAGroup);

    // Tank A Glass Shell
    const shellGeo = new THREE.CylinderGeometry(1.6, 1.6, 5, 32, 1, true);
    const shellAMesh = new THREE.Mesh(shellGeo, tankShellMat);
    shellAMesh.position.y = 2.5;
    tankAGroup.add(shellAMesh);

    // Tank A Top Lid
    const lidGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.2, 32);
    const lidAMesh = new THREE.Mesh(lidGeo, lidMat);
    lidAMesh.position.y = 5;
    tankAGroup.add(lidAMesh);

    // Tank A Base
    const baseGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.3, 32);
    const baseAMesh = new THREE.Mesh(baseGeo, baseMat);
    baseAMesh.position.y = 0;
    tankAGroup.add(baseAMesh);

    // Tank A Liquid Group (scales from Y=0 bottom)
    const liquidAGroup = new THREE.Group();
    liquidAGroup.position.y = 0.1;
    tankAGroup.add(liquidAGroup);

    const liquidAGeo = new THREE.CylinderGeometry(1.52, 1.52, 4.8, 32);
    const liquidAMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.2,
      transparent: true,
      opacity: 0.75
    });
    const liquidAMesh = new THREE.Mesh(liquidAGeo, liquidAMat);
    liquidAMesh.position.y = 2.4; // offset by half height so origin sits at bottom
    liquidAGroup.add(liquidAMesh);

    // Tank A Agitator
    const agitatorGroup = new THREE.Group();
    agitatorGroup.position.y = 5;
    tankAGroup.add(agitatorGroup);

    // Agitator Motor Casing
    const motorGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 16);
    const motorMesh = new THREE.Mesh(motorGeo, lidMat);
    motorMesh.position.y = 0.4;
    agitatorGroup.add(motorMesh);

    // Agitator Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.1, metalness: 0.9 });
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.position.y = -2.5;
    agitatorGroup.add(shaftMesh);

    // Agitator Blades
    const bladesGroup = new THREE.Group();
    bladesGroup.position.y = -4.3;
    agitatorGroup.add(bladesGroup);
    const bladeGeo = new THREE.BoxGeometry(2.2, 0.3, 0.08);
    const blade1 = new THREE.Mesh(bladeGeo, baseMat);
    bladesGroup.add(blade1);
    const blade2 = new THREE.Mesh(bladeGeo, baseMat);
    blade2.rotation.y = Math.PI / 2;
    bladesGroup.add(blade2);

    // Alarm Beacon Support & Dome (Top of Tank A)
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8);
    const postMesh = new THREE.Mesh(postGeo, baseMat);
    postMesh.position.set(0, 5.25, 0);
    tankAGroup.add(postMesh);

    const alarmGeo = new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const alarmMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.1 });
    const alarmMesh = new THREE.Mesh(alarmGeo, alarmMat);
    alarmMesh.position.set(0, 5.5, 0);
    tankAGroup.add(alarmMesh);

    // ==========================================
    // TANK B: PRODUCT TANK (Right, X = 2.5)
    // ==========================================
    const tankBGroup = new THREE.Group();
    tankBGroup.position.x = 2.5;
    assemblyGroup.add(tankBGroup);

    // Tank B Shell
    const shellBMesh = new THREE.Mesh(shellGeo, tankShellMat);
    shellBMesh.position.y = 2.5;
    tankBGroup.add(shellBMesh);

    // Tank B Top Lid
    const lidBMesh = new THREE.Mesh(lidGeo, lidMat);
    lidBMesh.position.y = 5;
    tankBGroup.add(lidBMesh);

    // Tank B Base
    const baseBMesh = new THREE.Mesh(baseGeo, baseMat);
    baseBMesh.position.y = 0;
    tankBGroup.add(baseBMesh);

    // Tank B Liquid Group (scales from Y=0 bottom)
    const liquidBGroup = new THREE.Group();
    liquidBGroup.position.y = 0.1;
    tankBGroup.add(liquidBGroup);

    const liquidBMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8, // Indigo product color
      roughness: 0.2,
      transparent: true,
      opacity: 0.75
    });
    const liquidBMesh = new THREE.Mesh(liquidAGeo, liquidBMat);
    liquidBMesh.position.y = 2.4;
    liquidBGroup.add(liquidBMesh);

    // ==========================================
    // DRAIN STUBS & PIPES
    // ==========================================
    const stubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 12);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.8 });

    // Tank A Bottom Drain Stub
    const drainStubA = new THREE.Mesh(stubGeo, metalMat);
    drainStubA.position.set(0, -0.4, 0);
    tankAGroup.add(drainStubA);

    // Tank B Bottom Drain Stub
    const drainStubB = new THREE.Mesh(stubGeo, metalMat);
    drainStubB.position.set(0, -0.4, 0);
    tankBGroup.add(drainStubB);

    // Drain drip particles
    const dripGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const dripMatA = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const dripMatB = new THREE.MeshBasicMaterial({ color: 0x818cf8 });

    const dripMeshA = new THREE.Mesh(dripGeo, dripMatA);
    dripMeshA.position.set(-2.5, -2.6, 0);
    assemblyGroup.add(dripMeshA);

    const dripMeshB = new THREE.Mesh(dripGeo, dripMatB);
    dripMeshB.position.set(2.5, -2.6, 0);
    assemblyGroup.add(dripMeshB);

    // ==========================================
    // CONNECTING PIPE & DSV VALVE
    // ==========================================
    // Pipe at bottom level (Y = 0.4) bridging Left to Right
    const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.4, 16);
    const pipeMesh = new THREE.Mesh(pipeGeo, metalMat);
    pipeMesh.position.set(0, 0.4, 0);
    pipeMesh.rotation.z = Math.PI / 2;
    assemblyGroup.add(pipeMesh);

    // Inlet connection elbows
    const elbowGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16);
    const elbowA = new THREE.Mesh(elbowGeo, metalMat);
    elbowA.position.set(-1.7, 0.2, 0);
    assemblyGroup.add(elbowA);
    const elbowB = new THREE.Mesh(elbowGeo, metalMat);
    elbowB.position.set(1.7, 0.2, 0);
    assemblyGroup.add(elbowB);

    // DSV Valve T-junction block in center (X = 0, Y = 0.4)
    const valveBodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const valveBody = new THREE.Mesh(valveBodyGeo, metalMat);
    valveBody.position.set(0, 0.4, 0);
    assemblyGroup.add(valveBody);

    // Valve handle shaft
    const handleShaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
    const handleShaft = new THREE.Mesh(handleShaftGeo, metalMat);
    handleShaft.position.set(0, 0.7, 0);
    assemblyGroup.add(handleShaft);

    // Valve Indicator Light (Top of body)
    const indGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const indMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 });
    const indicator = new THREE.Mesh(indGeo, indMat);
    indicator.position.set(0, 0.95, 0);
    assemblyGroup.add(indicator);

    // ==========================================
    // PHYSICAL PUMP ASSEMBLY (X = -1.1)
    // ==========================================
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(-1.0, 0.4, 0);
    assemblyGroup.add(pumpGroup);

    // Pump Casing
    const pumpCasingGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.4, 16);
    const pumpCasingMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.7 });
    const pumpCasing = new THREE.Mesh(pumpCasingGeo, pumpCasingMat);
    pumpCasing.rotation.x = Math.PI / 2; // Aligned along depth axis
    pumpGroup.add(pumpCasing);

    // Pump Motor Box
    const motorBoxGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const motorBox = new THREE.Mesh(motorBoxGeo, lidMat);
    motorBox.position.set(0, 0.24, 0);
    pumpGroup.add(motorBox);

    // Pump Rotor Spinner Fan (on Z face)
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(0, 0, 0.22);
    pumpGroup.add(rotorGroup);
    const rotorBladeGeo = new THREE.BoxGeometry(0.36, 0.06, 0.04);
    const rBlade1 = new THREE.Mesh(rotorBladeGeo, baseMat);
    rotorGroup.add(rBlade1);
    const rBlade2 = new THREE.Mesh(rotorBladeGeo, baseMat);
    rBlade2.rotation.z = Math.PI / 2;
    rotorGroup.add(rBlade2);

    // Pump Indicator Light (on top of motor)
    const pumpIndMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2 });
    const pumpIndicator = new THREE.Mesh(indGeo, pumpIndMat);
    pumpIndicator.scale.setScalar(0.7);
    pumpIndicator.position.set(0, 0.45, 0);
    pumpGroup.add(pumpIndicator);

    // Flow Particle spheres inside the pipe
    const pCount = 4;
    const flowParticles: THREE.Mesh[] = [];
    const flowMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });

    for (let i = 0; i < pCount; i++) {
      const p = new THREE.Mesh(dripGeo, flowMat);
      p.position.set(0, 0.4, 0);
      assemblyGroup.add(p);
      flowParticles.push(p);
    }

    // --- Animation loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let flowTime = 0;
    let dripTimeA = 0;
    let dripTimeB = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Read values transiently from store
      const {
        sourceFill,
        productFill,
        transferActive,
        valveOpen,
        alarmState,
        temperature,
        sourceDrainActive,
        productDrainActive
      } = useTelemetryStore.getState();

      // 1. Scale liquid levels
      const scaleA = Math.max(0.01, sourceFill / 100);
      liquidAGroup.scale.y = THREE.MathUtils.lerp(liquidAGroup.scale.y, scaleA, 10 * delta);

      const scaleB = Math.max(0.01, productFill / 100);
      liquidBGroup.scale.y = THREE.MathUtils.lerp(liquidBGroup.scale.y, scaleB, 10 * delta);

      // 2. Adjust liquid A color based on temperature
      const heatFactor = Math.min(1, Math.max(0, (temperature - 100) / 100));
      liquidAMat.color.lerpColors(
        new THREE.Color('#3b82f6'),
        new THREE.Color('#ef4444'),
        heatFactor
      );

      // 3. Rotate tank agitator blade
      const currentRpm = transferActive ? 1500 : 0;
      const rps = currentRpm / 60;
      agitatorGroup.rotation.y += rps * delta * Math.PI * 2;

      // 4. DSV Valve Indicator Light
      if (valveOpen) {
        indMat.color.setHex(0x10b981); // Green
        indMat.emissive = new THREE.Color(0x059669);
        indMat.emissiveIntensity = 1.0;
        handleShaft.rotation.y = 0;
      } else {
        indMat.color.setHex(0xef4444); // Red
        indMat.emissive = new THREE.Color(0xdc2626);
        indMat.emissiveIntensity = 1.0;
        handleShaft.rotation.y = Math.PI / 4;
      }

      // 5. Connecting Flow Particles & Pump Animations
      if (transferActive) {
        // Spin Pump rotor
        rotorGroup.rotation.z += delta * 15;
        // Make pump light glow green
        pumpIndMat.color.setHex(0x10b981);
        pumpIndMat.emissive = new THREE.Color(0x059669);
        pumpIndMat.emissiveIntensity = 1.2;

        if (valveOpen) {
          flowTime += delta * 2.2;
          flowParticles.forEach((p, idx) => {
            p.scale.setScalar(1.0);
            const startX = -1.7;
            const endX = 1.7;
            let tX = startX + ((flowTime + idx * 0.85) % 3.4);
            p.position.set(tX, 0.4, 0);
          });
        } else {
          // Blocked by valve
          flowParticles.forEach(p => p.scale.setScalar(0));
        }
      } else {
        // Pump Off
        pumpIndMat.color.setHex(0x334155);
        pumpIndMat.emissive = new THREE.Color(0x000000);
        pumpIndMat.emissiveIntensity = 0;
        flowParticles.forEach(p => p.scale.setScalar(0));
      }

      // 6. Drain Drips
      if (sourceDrainActive && sourceFill > 0) {
        dripTimeA += delta * 3.5;
        dripMeshA.scale.setScalar(1.0);
        const startY = -0.55;
        const currentY = startY - ((dripTimeA) % 1.5);
        dripMeshA.position.set(-2.5, currentY, 0);
      } else {
        dripMeshA.scale.setScalar(0);
      }

      if (productDrainActive && productFill > 0) {
        dripTimeB += delta * 3.5;
        dripMeshB.scale.setScalar(1.0);
        const startY = -0.55;
        const currentY = startY - ((dripTimeB) % 1.5);
        dripMeshB.position.set(2.5, currentY, 0);
      } else {
        dripMeshB.scale.setScalar(0);
      }

      // 7. Hazard Alarm Beacon Dome
      if (alarmState) {
        const pulse = Math.sin(elapsedTime * 12) > 0;
        alarmMat.color.setHex(pulse ? 0xef4444 : 0x1e1b4b);
        alarmMat.emissive = new THREE.Color(pulse ? 0xf43f5e : 0x000000);
        alarmMat.emissiveIntensity = pulse ? 2.5 : 0;
        alarmMesh.scale.setScalar(pulse ? 1.25 : 1.0);
      } else {
        alarmMat.color.setHex(0x334155);
        alarmMat.emissive = new THREE.Color(0x000000);
        alarmMat.emissiveIntensity = 0;
        alarmMesh.scale.setScalar(1.0);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // --- Resize handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      
      // Dispose materials & geometries
      lidMat.dispose();
      baseMat.dispose();
      tankShellMat.dispose();
      shellGeo.dispose();
      lidGeo.dispose();
      baseGeo.dispose();
      liquidAGeo.dispose();
      liquidAMat.dispose();
      liquidBMat.dispose();
      motorGeo.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      bladeGeo.dispose();
      postGeo.dispose();
      alarmGeo.dispose();
      alarmMat.dispose();
      stubGeo.dispose();
      metalMat.dispose();
      dripGeo.dispose();
      dripMatA.dispose();
      dripMatB.dispose();
      pipeGeo.dispose();
      elbowGeo.dispose();
      valveBodyGeo.dispose();
      handleShaftGeo.dispose();
      indGeo.dispose();
      indMat.dispose();
      flowMat.dispose();
      pumpCasingGeo.dispose();
      pumpCasingMat.dispose();
      motorBoxGeo.dispose();
      rotorBladeGeo.dispose();
      pumpIndMat.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full relative min-h-[350px] md:min-h-[450px] rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur border border-slate-800/80 px-2.5 py-1 rounded text-[10px] text-slate-400 select-none pointer-events-none">
        🎮 3D SCADA Viewport (Drag to orbit, Scroll to zoom)
      </div>
    </div>
  );
}
