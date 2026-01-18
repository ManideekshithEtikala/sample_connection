import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";

const Agent = () => {
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1}>
      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>

      {/* Body */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.2, 32]} />
        <meshStandardMaterial color="#818cf8" />
      </mesh>
    </Float>
  );
};

const AgentBackground = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 3]} intensity={1} />
        <Agent />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default AgentBackground;
