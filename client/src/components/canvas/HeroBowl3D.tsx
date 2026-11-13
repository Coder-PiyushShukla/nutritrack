import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";

const FOREST = "#174A3A";
const LIME = "#C6E86B";
const IVORY = "#F6F4EA";

function Fruit({
  position,
  color,
  scale = 1,
  kind = "sphere",
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  kind?: "sphere" | "torus" | "leaf" | "capsule";
}) {
  return (
    <Float speed={1.6} rotationIntensity={1.2} floatIntensity={1.4}>
      <mesh position={position} scale={scale} castShadow>
        {kind === "sphere" && <sphereGeometry args={[0.5, 48, 48]} />}
        {kind === "torus" && <torusGeometry args={[0.45, 0.18, 32, 64]} />}
        {kind === "leaf" && <coneGeometry args={[0.35, 0.9, 32]} />}
        {kind === "capsule" && <capsuleGeometry args={[0.25, 0.6, 16, 32]} />}
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>
    </Float>
  );
}

function Bowl() {
  return (
    <group position={[0, -0.6, 0]}>
      <mesh rotation={[Math.PI, 0, 0]} castShadow>
        <sphereGeometry args={[1.3, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={IVORY} roughness={0.25} side={2} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.22, 64]} />
        <meshStandardMaterial color={FOREST} roughness={0.6} />
      </mesh>
      {[...Array(7)].map((_, i) => (
        <mesh
          key={i}
          position={[Math.cos(i) * 0.7, 0.18, Math.sin(i * 1.3) * 0.6]}
          castShadow
        >
          <sphereGeometry args={[0.2 + (i % 3) * 0.05, 32, 32]} />
          <meshStandardMaterial color={i % 2 ? LIME : IVORY} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const g = useRef<Group>(null);
  useFrame(({ pointer, clock }) => {
    if (!g.current) return;
    g.current.rotation.y +=
      (pointer.x * 0.5 + clock.elapsedTime * 0.08 - g.current.rotation.y) * 0.05;
    g.current.rotation.x += (-pointer.y * 0.2 - g.current.rotation.x) * 0.05;
  });
  return (
    <group ref={g}>
      <Bowl />
      <Fruit position={[-2, 1.2, 0]} color={LIME} scale={1.1} />
      <Fruit position={[2.1, 1.4, -0.5]} color={FOREST} kind="torus" />
      <Fruit position={[1.7, -0.2, 1]} color={LIME} kind="capsule" />
      <Fruit position={[-1.8, -0.4, 1]} color={FOREST} kind="leaf" scale={0.9} />
      <Fruit position={[0.2, 2, -1]} color={IVORY} scale={0.7} />
      <Fruit position={[-0.9, 2.3, 0.6]} color={LIME} scale={0.45} />
    </group>
  );
}

export function HeroBowl3DCanvas() {
  return (
    <div className="w-full h-[500px] sm:h-[560px] lg:h-[620px] relative select-none">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 1, 8], fov: 40 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 4]} intensity={1.6} castShadow />
        <hemisphereLight args={["#F6F4EA", "#174A3A", 0.8]} />
        <Scene />
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.35}
          scale={10}
          blur={2.5}
          color={FOREST}
        />
      </Canvas>
    </div>
  );
}

export default HeroBowl3DCanvas;
