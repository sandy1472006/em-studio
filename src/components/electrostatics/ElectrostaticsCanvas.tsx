import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { PointCharge } from '../../types/electrostatics';
import { Vector3D } from '../../types/common';
import { RotateCcw } from 'lucide-react';

interface ChargeSphereProps {
  charge: PointCharge;
  isSelected: boolean;
  onSelect: () => void;
}

const ChargeSphere: React.FC<ChargeSphereProps> = ({ charge, isSelected, onSelect }) => {
  const isPositive = charge.charge > 0;
  const color = isPositive ? '#E57373' : '#64B5F6';

  return (
    <group position={[charge.position.x, charge.position.y, charge.position.z]}>
      {/* Outer selection ring */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshBasicMaterial color="#55C8DD" wireframe transparent opacity={0.6} />
        </mesh>
      )}

      {/* Main Charge Sphere */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[0.09, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* 3D Plus/Minus Sign Marker */}
      {isPositive ? (
        <group position={[0, 0, 0.092]}>
          <mesh>
            <boxGeometry args={[0.05, 0.012, 0.005]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.012, 0.05, 0.005]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ) : (
        <group position={[0, 0, 0.092]}>
          <mesh>
            <boxGeometry args={[0.05, 0.012, 0.005]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Render field lines as 3D line geometries
const FieldLinesRenderer: React.FC = () => {
  const fieldLines = useElectrostaticsStore((s) => s.fieldLines);

  const lineObjects = useMemo(() => {
    return fieldLines.map((line) => {
      const points = line.map((p) => new THREE.Vector3(p.position.x, p.position.y, p.position.z));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return geometry;
    });
  }, [fieldLines]);

  return (
    <group>
      {lineObjects.map((geom, idx) => (
        <primitive
          key={idx}
          object={
            new THREE.Line(
              geom,
              new THREE.LineBasicMaterial({
                color: 0x55c8dd,
                transparent: true,
                opacity: 0.75,
                linewidth: 1.5,
              })
            )
          }
        />
      ))}
    </group>
  );
};

// Render observation point probe
const ObservationProbe: React.FC<{ point: Vector3D }> = ({ point }) => {
  return (
    <group position={[point.x, point.y, point.z]}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color="#D4A843"
          emissive="#D4A843"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[0.07, 0.08, 24]} />
        <meshBasicMaterial color="#D4A843" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Render 2D scalar potential plane slice
const PotentialPlaneOverlay: React.FC = () => {
  const potentialMap = useElectrostaticsStore((s) => s.potentialMap);

  const texture = useMemo(() => {
    if (!potentialMap) return null;
    const { xValues, yValues, potentials } = potentialMap;
    const width = xValues.length;
    const height = yValues.length;

    const data = new Uint8Array(width * height * 4);
    let maxAbs = 1;
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const val = Math.abs(potentials[j][i]);
        if (val > maxAbs) maxAbs = val;
      }
    }
    maxAbs = Math.min(maxAbs, 150);

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const idx = (j * width + i) * 4;
        const v = potentials[j][i];
        const normalized = Math.max(-1, Math.min(1, v / maxAbs));

        if (normalized >= 0) {
          data[idx] = Math.round(229 * normalized);
          data[idx + 1] = Math.round(115 * normalized);
          data[idx + 2] = Math.round(115 * normalized);
          data[idx + 3] = Math.round(80 * Math.sqrt(normalized));
        } else {
          const negNorm = Math.abs(normalized);
          data[idx] = Math.round(100 * negNorm);
          data[idx + 1] = Math.round(181 * negNorm);
          data[idx + 2] = Math.round(246 * negNorm);
          data[idx + 3] = Math.round(80 * Math.sqrt(negNorm));
        }
      }
    }

    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, [potentialMap]);

  if (!texture) return null;

  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[5, 5]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.65}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

export const ElectrostaticsCanvas: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const charges = useElectrostaticsStore((s) => s.charges);
  const selectedId = useElectrostaticsStore((s) => s.selectedChargeId);
  const selectCharge = useElectrostaticsStore((s) => s.selectCharge);
  const observationPoint = useElectrostaticsStore((s) => s.observationPoint);
  const viewMode = useElectrostaticsStore((s) => s.viewMode);
  const showGrid = useElectrostaticsStore((s) => s.showGrid);
  const showAxes = useElectrostaticsStore((s) => s.showAxes);
  const showLegend = useElectrostaticsStore((s) => s.showLegend);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-full bg-em-bg overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 48 }}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => selectCharge(null)}
      >
        <color attach="background" args={['#0D1117']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.2}
          maxDistance={12}
        />

        {/* Subtle Ground Grid */}
        {showGrid && (
          <gridHelper
            args={[6, 12, 0x283341, 0x1c2533]}
            position={[0, -0.01, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        )}

        {/* Coordinate Axes */}
        {showAxes && <axesHelper args={[2]} />}

        {/* Potential Map Overlay Plane */}
        {(viewMode === 'potential-map' || viewMode === 'combined') && <PotentialPlaneOverlay />}

        {/* Electric Field Lines */}
        {(viewMode === 'field-lines' || viewMode === 'combined') && <FieldLinesRenderer />}

        {/* Point Charges */}
        {charges.map((charge) => (
          <ChargeSphere
            key={charge.id}
            charge={charge}
            isSelected={charge.id === selectedId}
            onSelect={() => selectCharge(charge.id)}
          />
        ))}

        {/* Observation Probe */}
        <ObservationProbe point={observationPoint} />
      </Canvas>

      {/* Viewport Top Overlay Toolbar */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <button
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-medium rounded bg-em-surface/90 border border-em-border text-em-text-secondary hover:text-em-text-primary hover:bg-em-surface-light shadow transition-colors cursor-pointer backdrop-blur"
          title="Reset 3D Camera View"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Camera</span>
        </button>
      </div>

      {/* Physical Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 bg-em-surface/90 border border-em-border px-3 py-2 rounded text-2xs text-em-text-secondary backdrop-blur z-10 shadow flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E57373]" />
            <span>+ Charge (Source)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64B5F6]" />
            <span>− Charge (Sink)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-em-accent inline-block" />
            <span>Field Line (E-vector)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-em-warning" />
            <span>Observation Probe</span>
          </div>
        </div>
      )}
    </div>
  );
};
