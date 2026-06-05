'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useRpsStore } from '@/lib/store/useRpsStore';
import { playSortSound } from '@/lib/utils/audio';

// Bounding box dimensions for the 3D space
const BOX_WIDTH = 50;
const BOX_HEIGHT = 35;
const BOX_DEPTH = 35;

// Constants for physics
const MAX_SPEED = 0.25;
const STEER_FORCE = 0.015;
const COLLISION_DIST = 1.8;
const FLEE_DIST = 15; // Distance at which predator triggers fleeing

interface Entity {
  id: number;
  type: 'rock' | 'paper' | 'scissors';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  sprite: THREE.Sprite;
}

export default function SimulationCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    isPlaying,
    speedMultiplier,
    volume,
    isMuted,
    initialRockCount,
    initialPaperCount,
    initialScissorsCount,
    updateCounts,
    finishSimulation,
    isFinished,
    movementMode,
    resetKey
  } = useRpsStore();

  // Keep references to avoid re-running useEffect on state changes
  const stateRef = useRef({ isPlaying, speedMultiplier, volume, isMuted, movementMode });
  useEffect(() => {
    stateRef.current = { isPlaying, speedMultiplier, volume, isMuted, movementMode };
  }, [isPlaying, speedMultiplier, volume, isMuted, movementMode]);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712'); // Slate-950

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear previous canvas
    containerRef.current.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 120;
    controls.minDistance = 10;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // --- Arena Boundary Wireframe ---
    const boundaryGeo = new THREE.BoxGeometry(BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH);
    const edges = new THREE.EdgesGeometry(boundaryGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 2 }); // Slate-700
    const boundaryBox = new THREE.LineSegments(edges, lineMat);
    scene.add(boundaryBox);

    // --- Emoji Texture Generators ---
    const textures: Record<'rock' | 'paper' | 'scissors' | 'scared', THREE.Texture> = {
      rock: createEmojiTexture('🪨'),
      paper: createEmojiTexture('📄'),
      scissors: createEmojiTexture('✂️'),
      scared: createEmojiTexture('😱')
    };

    // --- Spawn Entities ---
    let entities: Entity[] = [];
    let idCounter = 0;

    const spawnType = (type: 'rock' | 'paper' | 'scissors', count: number) => {
      const spriteMat = new THREE.SpriteMaterial({ map: textures[type], transparent: true });
      
      for (let i = 0; i < count; i++) {
        const sprite = new THREE.Sprite(spriteMat.clone());
        sprite.scale.set(2.5, 2.5, 1);
        
        // Random position inside bounding box
        const x = (Math.random() - 0.5) * (BOX_WIDTH - 4);
        const y = (Math.random() - 0.5) * (BOX_HEIGHT - 4);
        const z = (Math.random() - 0.5) * (BOX_DEPTH - 4);
        sprite.position.set(x, y, z);
        
        // Random velocity
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        );

        scene.add(sprite);

        entities.push({
          id: idCounter++,
          type,
          position: sprite.position,
          velocity,
          sprite
        });
      }
    };

    spawnType('rock', initialRockCount);
    spawnType('paper', initialPaperCount);
    spawnType('scissors', initialScissorsCount);

    // Initial counts update
    updateCounts(initialRockCount, initialPaperCount, initialScissorsCount);

    // --- Animation & Physics Loop ---
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const { isPlaying: playing, speedMultiplier: mult, volume: vol, isMuted: muted, movementMode: mode } = stateRef.current;
      
      if (playing && !isFinished) {
        const stepSpeed = MAX_SPEED * mult;
        const steerForce = STEER_FORCE * mult;

        // 0. Compute counts for doomed state check
        let rockCount = 0;
        let paperCount = 0;
        let scissorsCount = 0;
        entities.forEach(e => {
          if (e.type === 'rock') rockCount++;
          else if (e.type === 'paper') paperCount++;
          else if (e.type === 'scissors') scissorsCount++;
        });

        const isRockDoomed = scissorsCount === 0 && paperCount > 0;
        const isPaperDoomed = rockCount === 0 && scissorsCount > 0;
        const isScissorsDoomed = paperCount === 0 && rockCount > 0;

        // 1. Physics & Steering forces
        entities.forEach(entity => {
          const isDoomed = 
            (entity.type === 'rock' && isRockDoomed) ||
            (entity.type === 'paper' && isPaperDoomed) ||
            (entity.type === 'scissors' && isScissorsDoomed);

          // Update texture on the fly
          entity.sprite.material.map = isDoomed ? textures.scared : textures[entity.type];

          // Visual wobble/shake animation (personality wiggles)
          const time = Date.now() * 0.015;
          const wobbleFreq = isDoomed ? 4.5 : (mode === 'chaos' ? 2.5 : 1.2);
          const wobbleAmp = isDoomed ? 0.6 : (mode === 'chaos' ? 0.35 : 0.15);
          const scaleOffset = Math.sin(time * wobbleFreq + entity.id) * wobbleAmp;
          entity.sprite.scale.set(2.5 + scaleOffset, 2.5 + scaleOffset, 1);
          entity.sprite.material.rotation = Math.sin(time * wobbleFreq * 1.5 + entity.id) * (wobbleAmp * 0.7);

          const currentMaxSpeed = isDoomed ? stepSpeed * 0.35 : stepSpeed;

          let prey: Entity | null = null;
          let predator: Entity | null = null;
          let minPreyDist = Infinity;
          let minPredDist = Infinity;

          // Target configuration
          const targets = {
            rock: { prey: 'scissors', predator: 'paper' },
            paper: { prey: 'rock', predator: 'scissors' },
            scissors: { prey: 'paper', predator: 'rock' }
          };

          const behavior = targets[entity.type];

          // Find closest prey and predator
          entities.forEach(other => {
            if (other.id === entity.id) return;
            const dist = entity.position.distanceTo(other.position);
            
            if (other.type === behavior.prey) {
              if (dist < minPreyDist) {
                minPreyDist = dist;
                prey = other;
              }
            } else if (other.type === behavior.predator) {
              if (dist < minPredDist) {
                minPredDist = dist;
                predator = other;
              }
            }
          });

          // Calculate Steering Force
          const acceleration = new THREE.Vector3();

          if (mode === 'wander') {
            // Wander random force
            const wanderForce = new THREE.Vector3(
              (Math.random() - 0.5) * 0.25,
              (Math.random() - 0.5) * 0.25,
              (Math.random() - 0.5) * 0.25
            ).multiplyScalar(currentMaxSpeed * 0.3);
            acceleration.add(wanderForce);
          } else {
            // Hunt mode
            // Seek Prey
            if (prey) {
              const seekForce = new THREE.Vector3()
                .subVectors((prey as Entity).position, entity.position)
                .normalize()
                .multiplyScalar(currentMaxSpeed)
                .sub(entity.velocity)
                .multiplyScalar(steerForce);
              acceleration.add(seekForce);
            }

            // Flee Predator
            if (predator && minPredDist < FLEE_DIST) {
              const fleeForce = new THREE.Vector3()
                .subVectors(entity.position, (predator as Entity).position)
                .normalize()
                .multiplyScalar(currentMaxSpeed)
                .sub(entity.velocity)
                .multiplyScalar(steerForce * 1.5); // Flee harder
              acceleration.add(fleeForce);
            }

            // Add extra jitter in chaos mode
            if (mode === 'chaos') {
              const chaosForce = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
              ).multiplyScalar(currentMaxSpeed * 0.5);
              acceleration.add(chaosForce);
            }
          }

          // Update velocity & position
          entity.velocity.add(acceleration).clampLength(0, currentMaxSpeed);
          entity.position.add(entity.velocity);

          // Bouncing off box boundaries
          const halfW = BOX_WIDTH / 2 - 1.25;
          const halfH = BOX_HEIGHT / 2 - 1.25;
          const halfD = BOX_DEPTH / 2 - 1.25;

          if (entity.position.x > halfW) { entity.position.x = halfW; entity.velocity.x *= -1; }
          if (entity.position.x < -halfW) { entity.position.x = -halfW; entity.velocity.x *= -1; }
          
          if (entity.position.y > halfH) { entity.position.y = halfH; entity.velocity.y *= -1; }
          if (entity.position.y < -halfH) { entity.position.y = -halfH; entity.velocity.y *= -1; }
          
          if (entity.position.z > halfD) { entity.position.z = halfD; entity.velocity.z *= -1; }
          if (entity.position.z < -halfD) { entity.position.z = -halfD; entity.velocity.z *= -1; }
        });

        // 2. Collision detection & battles
        let hasCollisions = false;

        for (let i = 0; i < entities.length; i++) {
          const e1 = entities[i];
          
          for (let j = i + 1; j < entities.length; j++) {
            const e2 = entities[j];
            if (e1.type === e2.type) continue;

            const dist = e1.position.distanceTo(e2.position);
            
            if (dist < COLLISION_DIST) {
              let winner: Entity | null = null;
              let loser: Entity | null = null;

              if (
                (e1.type === 'rock' && e2.type === 'scissors') ||
                (e1.type === 'paper' && e2.type === 'rock') ||
                (e1.type === 'scissors' && e2.type === 'paper')
              ) {
                winner = e1;
                loser = e2;
              } else {
                winner = e2;
                loser = e1;
              }

              // Conversion / duplication logic: loser is eaten and transforms into winner
              loser.type = winner.type;
              loser.sprite.material.map = textures[winner.type];
              
              // Bounce apart slightly on collision
              const bounceVec = new THREE.Vector3().subVectors(winner.position, loser.position).normalize().multiplyScalar(0.2);
              winner.velocity.add(bounceVec);
              loser.velocity.sub(bounceVec);

              hasCollisions = true;
            }
          }
        }

        // Play collision sound
        if (hasCollisions) {
          // Play a retro synth tone frequency based on volume
          playSortSound(50, 100, vol, muted);
        }

        // 3. Count updates and game over check
        let rocks = 0;
        let papers = 0;
        let scissors = 0;

        entities.forEach(e => {
          if (e.type === 'rock') rocks++;
          else if (e.type === 'paper') papers++;
          else if (e.type === 'scissors') scissors++;
        });

        updateCounts(rocks, papers, scissors);

        // Win condition check
        const total = rocks + papers + scissors;
        if (rocks === total) {
          finishSimulation('rock');
        } else if (papers === total) {
          finishSimulation('paper');
        } else if (scissors === total) {
          finishSimulation('scissors');
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      entities.forEach(e => {
        e.sprite.geometry.dispose();
        if (Array.isArray(e.sprite.material)) {
          e.sprite.material.forEach(m => m.dispose());
        } else {
          e.sprite.material.dispose();
        }
      });
      Object.values(textures).forEach(t => t.dispose());
    };
  }, [initialRockCount, initialPaperCount, initialScissorsCount, resetKey]);

  return (
    <div className="relative w-full h-[60vh] md:h-[65vh] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />
      {/* 3D interaction tip */}
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1 rounded text-[10px] text-slate-400 select-none">
        🖱️ Left Click + Drag to rotate | Scroll to zoom
      </div>
    </div>
  );
}

// Helper to draw Emoji text into a canvas texture
function createEmojiTexture(emoji: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Enable anti-aliasing styling
    ctx.imageSmoothingEnabled = true;
    ctx.font = '84px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 64, 64);
  }
  
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}
