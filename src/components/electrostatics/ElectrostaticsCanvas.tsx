import React, { useRef, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { PointCharge, ElectrostaticsViewMode } from '../../types/electrostatics';
import { Vector3D } from '../../types/common';
import { extractFieldLineArrows, FieldArrow } from '../../engine/electrostatics/fieldLines';
import { RotateCcw, Box, Maximize2, Camera } from 'lucide-react';

/**
 * Logarithmic Jet/Turbo colormap for field magnitude (10^2 to 10^6 V/m or T).
 * Matches the reference image colormap:
 * Red (10^6) -> Orange (10^5) -> Yellow (10^4) -> Cyan (10^3) -> Deep Blue (10^2).
 */
export function getFieldColor(magnitude: number, minLog = 2, maxLog = 6): THREE.Color {
  const safeMag = Math.max(10, magnitude || 0);
  const logVal = Math.log10(safeMag);
  const t = Math.max(0, Math.min(1, (logVal - minLog) / (maxLog - minLog)));

  const color = new THREE.Color();
  if (t < 0.25) {
    // Deep Blue to Electric Cyan
    const u = t / 0.25;
    color.setRGB(0.05 + 0.1 * u, 0.35 + 0.55 * u, 0.95);
  } else if (t < 0.5) {
    // Cyan to Yellow-Green
    const u = (t - 0.25) / 0.25;
    color.setRGB(0.15 + 0.8 * u, 0.9 - 0.05 * u, 0.95 - 0.75 * u);
  } else if (t < 0.75) {
    // Yellow to Radiant Orange
    const u = (t - 0.5) / 0.25;
    color.setRGB(0.95 + 0.05 * u, 0.85 - 0.4 * u, 0.2 - 0.18 * u);
  } else {
    // Orange to Pure Crimson Red
    const u = (t - 0.75) / 0.25;
    color.setRGB(1.0, 0.45 - 0.35 * u, 0.02);
  }
  return color;
}

interface ChargeSphereProps {
  charge: PointCharge;
  isSelected: boolean;
  onSelect: () => void;
  isMagnetic?: boolean;
}

const ChargeSphere: React.FC<ChargeSphereProps> = ({ charge, isSelected, onSelect, isMagnetic }) => {
  const isPositive = charge.charge > 0;
  const coreColor = isPositive ? '#EF4444' : '#3B82F6';
  const glowColor = isPositive ? '#FF2222' : '#2563EB';

  return (
    <group position={[charge.position.x, charge.position.y, charge.position.z]}>
      {/* Outer Selection Highlight Ring */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshBasicMaterial color="#55C8DD" wireframe transparent opacity={0.5} />
        </mesh>
      )}

      {/* Soft Corona Outer Glow */}
      <mesh>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.22} side={THREE.BackSide} />
      </mesh>

      {/* Main Charge Sphere */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[0.095, 32, 32]} />
        <meshStandardMaterial
          color={coreColor}
          roughness={0.2}
          metalness={0.15}
          emissive={coreColor}
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* Sign Glyphs (+ for positive/North, - for negative/South) */}
      {isPositive ? (
        <group position={[0, 0, 0.098]}>
          <mesh>
            <boxGeometry args={[0.052, 0.013, 0.005]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.013, 0.052, 0.005]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ) : (
        <group position={[0, 0, 0.098]}>
          <mesh>
            <boxGeometry args={[0.052, 0.013, 0.005]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Streamline Field Lines with Continuous Logarithmic Colormap
const ColoredStreamlines: React.FC = () => {
  const fieldLines = useElectrostaticsStore((s) => s.fieldLines);

  const { lineObjects, arrows } = useMemo(() => {
    const lines = fieldLines.map((line) => {
      const positions: number[] = [];
      const colors: number[] = [];

      for (let i = 0; i < line.length; i++) {
        const pt = line[i];
        positions.push(pt.position.x, pt.position.y, pt.position.z);
        const col = getFieldColor(pt.fieldMagnitude);
        colors.push(col.r, col.g, col.b);
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
        linewidth: 2,
      });

      return new THREE.Line(geom, mat);
    });

    const rawArrows = extractFieldLineArrows(fieldLines);
    return { lineObjects: lines, arrows: rawArrows };
  }, [fieldLines]);

  return (
    <group>
      {/* Streamline curves */}
      {lineObjects.map((line, idx) => (
        <primitive key={`line-${idx}`} object={line} />
      ))}

      {/* Directional Flow Arrow Cones */}
      {arrows.map((arr, idx) => {
        const col = getFieldColor(arr.magnitude);
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(arr.tangent.x, arr.tangent.y, arr.tangent.z).normalize()
        );

        return (
          <group
            key={`arr-${idx}`}
            position={[arr.position.x, arr.position.y, arr.position.z]}
            quaternion={quat}
          >
            <mesh position={[0, 0.015, 0]}>
              <coneGeometry args={[0.024, 0.055, 12]} />
              <meshBasicMaterial color={col} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// 3D Equipotential Rings & Surfaces
const EquipotentialSurfaces: React.FC = () => {
  const charges = useElectrostaticsStore((s) => s.charges);

  // Concentric equipotential circles around charges
  const circles = useMemo(() => {
    const list: { pos: Vector3D; r: number; color: string }[] = [];
    charges.forEach((c) => {
      const radii = [0.18, 0.28, 0.42, 0.62, 0.9, 1.3];
      radii.forEach((r) => {
        list.push({
          pos: c.position,
          r,
          color: c.charge > 0 ? '#E57373' : '#64B5F6',
        });
      });
    });
    return list;
  }, [charges]);

  return (
    <group>
      {circles.map((c, i) => (
        <group key={i} position={[c.pos.x, c.pos.y, c.pos.z]}>
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[c.r - 0.005, c.r + 0.005, 48]} />
            <meshBasicMaterial color={c.color} transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// 2D Potential Plane Texture Overlay
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
          data[idx] = Math.round(239 * normalized);
          data[idx + 1] = Math.round(68 * normalized);
          data[idx + 2] = Math.round(68 * normalized);
          data[idx + 3] = Math.round(90 * Math.sqrt(normalized));
        } else {
          const negNorm = Math.abs(normalized);
          data[idx] = Math.round(59 * negNorm);
          data[idx + 1] = Math.round(130 * negNorm);
          data[idx + 2] = Math.round(246 * negNorm);
          data[idx + 3] = Math.round(90 * Math.sqrt(negNorm));
        }
      }
    }

    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, [potentialMap]);

  if (!texture) return null;

  return (
    <mesh position={[0, 0, -0.005]}>
      <planeGeometry args={[5, 5]} />
      <meshBasicMaterial map={texture} transparent opacity={0.65} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Observation Point Probe
const ObservationProbe: React.FC<{ point: Vector3D }> = ({ point }) => {
  return (
    <group position={[point.x, point.y, point.z]}>
      <mesh>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color="#A855F7"
          emissive="#A855F7"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[0.065, 0.08, 24]} />
        <meshBasicMaterial color="#A855F7" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

export const ElectrostaticsCanvas: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const charges = useElectrostaticsStore((s) => s.charges);
  const selectedId = useElectrostaticsStore((s) => s.selectedChargeId);
  const selectCharge = useElectrostaticsStore((s) => s.selectCharge);
  const observationPoint = useElectrostaticsStore((s) => s.observationPoint);
  const viewMode = useElectrostaticsStore((s) => s.viewMode);
  const setViewMode = useElectrostaticsStore((s) => s.setViewMode);
  const showGrid = useElectrostaticsStore((s) => s.showGrid);
  const fieldType = useElectrostaticsStore((s) => s.fieldType ?? 'electric');

  const [isOrtho, setIsOrtho] = useState(false);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleCaptureSnapshot = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `em-studio-${fieldType}-dipole.png`;
    a.click();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#070A0F] overflow-hidden select-none"
    >
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 48 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        onPointerMissed={() => selectCharge(null)}
      >
        <color attach="background" args={['#070A0F']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.0}
          maxDistance={10}
        />

        {/* Subtle Dark Perspective Floor Grid */}
        {showGrid && (
          <gridHelper
            args={[6, 16, 0x1E293B, 0x0F172A]}
            position={[0, -0.01, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        )}

        {/* Potential Map 2D Heatmap Plane */}
        {(viewMode === 'potential-map' || viewMode === 'combined') && <PotentialPlaneOverlay />}

        {/* Equipotential Planes */}
        {(viewMode === 'equipotential' || viewMode === 'combined') && <EquipotentialSurfaces />}

        {/* Streamline Field Lines with Color Gradient */}
        {(viewMode === 'field-lines' || viewMode === 'combined' || viewMode === 'equipotential') && (
          <ColoredStreamlines />
        )}

        {/* Charge Spheres */}
        {charges.map((charge) => (
          <ChargeSphere
            key={charge.id}
            charge={charge}
            isSelected={charge.id === selectedId}
            onSelect={() => selectCharge(charge.id)}
            isMagnetic={fieldType === 'magnetic'}
          />
        ))}

        {/* Observation Probe Marker */}
        <ObservationProbe point={observationPoint} />
      </Canvas>

      {/* 1. Floating Top-Left View Mode Toolbar */}
      <div className="absolute top-3.5 left-4 z-20 flex items-center gap-1.5 p-1 rounded-lg bg-[#0E1522]/90 border border-[#1E293B] shadow-2xl backdrop-blur">
        {[
          { id: 'field-lines' as ElectrostaticsViewMode, label: 'Field Lines' },
          { id: 'field-vectors' as ElectrostaticsViewMode, label: 'Field Vectors' },
          { id: 'potential-map' as ElectrostaticsViewMode, label: 'Potential Surface' },
          { id: 'equipotential' as ElectrostaticsViewMode, label: 'Equipotential Planes' },
        ].map((mode) => {
          const isActive = viewMode === mode.id || (mode.id === 'field-lines' && viewMode === 'combined');
          return (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-em-accent/15 border border-em-accent text-em-accent shadow-sm'
                  : 'border border-transparent text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60'
              }`}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* 2. Floating Top-Right Viewport Actions Toolbar */}
      <div className="absolute top-3.5 right-4 z-20 flex items-center gap-1.5 p-1 rounded-lg bg-[#0E1522]/90 border border-[#1E293B] shadow-2xl backdrop-blur">
        <button
          onClick={() => setIsOrtho(!isOrtho)}
          className="p-1.5 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          title={isOrtho ? 'Switch to Perspective' : 'Switch to Orthogonal'}
        >
          <Box className="w-4 h-4" />
        </button>
        <button
          onClick={handleToggleFullscreen}
          className="p-1.5 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          title="Fullscreen Canvas"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleCaptureSnapshot}
          className="p-1.5 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          title="Export PNG Snapshot"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          onClick={resetCamera}
          className="p-1.5 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Bottom-Left 3D Coordinate Tripod Widget */}
      <div className="absolute bottom-5 left-5 z-20 flex flex-col items-center select-none pointer-events-none">
        <div className="relative w-14 h-14">
          {/* X axis (Red) */}
          <div className="absolute left-6 bottom-6 w-7 h-0.5 bg-[#EF4444] origin-left" />
          <span className="absolute left-14 bottom-4 text-2xs font-bold text-[#EF4444]">x</span>

          {/* Y axis (Green) */}
          <div className="absolute left-6 bottom-6 w-0.5 h-7 bg-[#22C55E] origin-bottom" />
          <span className="absolute left-5 bottom-14 text-2xs font-bold text-[#22C55E]">y</span>

          {/* Z axis (Blue) */}
          <div
            className="absolute left-6 bottom-6 w-6 h-0.5 bg-[#3B82F6] origin-left"
            style={{ transform: 'rotate(225deg)' }}
          />
          <span className="absolute left-1 bottom-1 text-2xs font-bold text-[#3B82F6]">z</span>

          {/* Origin Dot */}
          <div className="absolute left-5.5 bottom-5.5 w-1.5 h-1.5 rounded-full bg-white/80" />
        </div>
      </div>

      {/* 4. Vertical Logarithmic Field Strength Colormap Legend (Right Side) */}
      <div className="absolute top-20 right-4 z-20 flex flex-col items-center bg-[#0E1522]/85 border border-[#1E293B] px-3 py-2.5 rounded-lg shadow-2xl backdrop-blur select-none">
        <span className="text-2xs font-mono font-semibold text-[#94A3B8] mb-1.5">
          {fieldType === 'electric' ? '|E| (V/m)' : '|B| (T)'}
        </span>
        <div className="flex items-stretch gap-2">
          {/* Vertical Colorbar */}
          <div
            className="w-3.5 h-44 rounded-xs border border-white/10 shadow-inner"
            style={{
              background:
                'linear-gradient(to bottom, #EF4444 0%, #F97316 25%, #EAB308 50%, #06B6D4 75%, #1D4ED8 100%)',
            }}
          />
          {/* Scale Ticks and Values */}
          <div className="flex flex-col justify-between h-44 font-mono text-2xs text-[#94A3B8] leading-none py-0.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-px bg-[#475569]" />
              <span>10⁶</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-px bg-[#475569]" />
              <span>10⁵</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-px bg-[#475569]" />
              <span>10⁴</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-px bg-[#475569]" />
              <span>10³</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-px bg-[#475569]" />
              <span>10²</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
