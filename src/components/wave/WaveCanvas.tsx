import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useWaveStore } from '../../stores/waveStore';
import { getEFieldComponents, getHFieldComponents } from '../../engine/wave/polarisation';
import { RotateCcw } from 'lucide-react';

// Animated Vector Field representing Plane Wave (E & H arrows)
const WaveVectorField: React.FC = () => {
  const {
    frequency,
    amplitude,
    phase,
    polarisation,
    axRatio,
    phaseDifference,
    propagation,
    observationZ,
    animationSpeed,
    isPlaying,
    showPoynting,
  } = useWaveStore();

  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Sampling parameters along propagation z-axis
  const numSamples = 60;
  const zMax = 2.0;

  const alpha = propagation?.alpha ?? 0;
  const beta = propagation?.beta ?? (2 * Math.PI * frequency) / 3e8;

  // Reusable instanced lines/arrows
  const eArrows = useMemo(() => {
    return Array.from({ length: numSamples }, () => ({
      eLine: new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        new THREE.LineBasicMaterial({ color: 0x55c8dd, linewidth: 2 })
      ),
      hLine: new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        new THREE.LineBasicMaterial({ color: 0xd4a843, linewidth: 2 })
      ),
    }));
  }, [numSamples]);

  useFrame((_, delta) => {
    if (isPlaying) {
      timeRef.current += delta * animationSpeed * 2.5;
    }

    const t = timeRef.current / (2 * Math.PI * frequency);

    for (let i = 0; i < numSamples; i++) {
      const z = (i / (numSamples - 1)) * zMax;
      const spatialBeta = (2 * Math.PI) / 0.8;
      const visualAlpha = Math.min(alpha * 0.05, 3.0);

      const { Ex, Ey } = getEFieldComponents(
        polarisation,
        amplitude * 0.45,
        axRatio,
        phaseDifference,
        timeRef.current * 2.0,
        spatialBeta,
        t,
        z,
        visualAlpha
      );

      const { Hx, Hy } = getHFieldComponents(Ex, Ey, 1.0);

      const ePoints = [new THREE.Vector3(0, 0, z), new THREE.Vector3(Ex, Ey, z)];
      eArrows[i].eLine.geometry.setFromPoints(ePoints);

      const hPoints = [new THREE.Vector3(0, 0, z), new THREE.Vector3(Hx * 0.7, Hy * 0.7, z)];
      eArrows[i].hLine.geometry.setFromPoints(hPoints);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.0]}>
      {/* Central propagation axis line */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, zMax),
          ])}
        />
        <lineBasicMaterial attach="material" color="#283341" linewidth={2} />
      </line>

      {/* Render E & H vectors */}
      {eArrows.map((pair, idx) => (
        <group key={idx}>
          <primitive object={pair.eLine} />
          <primitive object={pair.hLine} />
        </group>
      ))}

      {/* Observation Probe along Z */}
      <mesh position={[0, 0, observationZ * (zMax / 1.0)]}>
        <ringGeometry args={[0.08, 0.09, 32]} />
        <meshBasicMaterial color="#55C8DD" side={THREE.DoubleSide} />
      </mesh>

      {/* Poynting Vector Arrow Indicator */}
      {showPoynting && (
        <group position={[0, -0.6, zMax / 2]}>
          <arrowHelper
            args={[
              new THREE.Vector3(0, 0, 1),
              new THREE.Vector3(0, 0, -0.4),
              0.8,
              0x4caf50,
              0.15,
              0.08,
            ]}
          />
        </group>
      )}
    </group>
  );
};

export const WaveCanvas: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const showGrid = useWaveStore((s) => s.showGrid);
  const showAxes = useWaveStore((s) => s.showAxes);
  const showLegend = useWaveStore((s) => s.showLegend);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-full bg-em-bg overflow-hidden select-none">
      <Canvas
        camera={{ position: [2.2, 1.4, 2.4], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0D1117']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.0}
          maxDistance={10}
        />

        {showGrid && (
          <gridHelper
            args={[5, 10, 0x283341, 0x1c2533]}
            position={[0, -0.7, 0]}
          />
        )}

        {showAxes && <axesHelper args={[1.5]} />}

        <WaveVectorField />
      </Canvas>

      {/* Toolbar */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <button
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-medium rounded bg-em-surface/90 border border-em-border text-em-text-secondary hover:text-em-text-primary hover:bg-em-surface-light shadow transition-colors cursor-pointer backdrop-blur"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Camera</span>
        </button>
      </div>

      {/* Scientific Vector Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 bg-em-surface/90 border border-em-border px-3 py-2 rounded text-2xs text-em-text-secondary backdrop-blur z-10 shadow flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#55C8DD] inline-block rounded-xs" />
            <span>Electric Field E (V/m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#D4A843] inline-block rounded-xs" />
            <span>Magnetic Field H (A/m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#4CAF50] inline-block rounded-xs" />
            <span>Poynting Vector S (W/m²)</span>
          </div>
        </div>
      )}
    </div>
  );
};
