import React from 'react';

interface RoomEnvironmentProps {
  roomType: 'physics' | 'chemistry' | 'math';
}

const RoomEnvironment: React.FC<RoomEnvironmentProps> = ({ roomType }) => {
  const renderChemistryRoom = () => (
    <group>
      {/* Tường gạch men trắng sáng */}
      <mesh position={[0, 5, -8]} receiveShadow>
        <boxGeometry args={[40, 15, 0.5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Bảng trắng lớn có viền nhôm */}
      <group position={[0, 5, -7.7]}>
        <mesh receiveShadow>
          <planeGeometry args={[14, 7]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {[[0, 3.6], [0, -3.6], [-7.1, 0], [7.1, 0]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.1]}>
            <boxGeometry args={[Math.abs(y) < 0.1 ? 14.2 : 0.2, Math.abs(x) < 0.1 ? 7 : 0.2, 0.1]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Tường bên trái - tủ đựng hóa chất */}
      <mesh position={[-10, 3, 0]} receiveShadow>
        <boxGeometry args={[0.5, 8, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
      </mesh>

      {/* Mặt bàn thí nghiệm - đá granite xám sáng chống axit */}
      <mesh receiveShadow castShadow position={[0, -1, 0]}>
        <boxGeometry args={[18, 0.6, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.15} metalness={0.3} />
      </mesh>

      {/* Viền bàn - inox */}
      <mesh position={[0, -0.68, 4.05]}>
        <boxGeometry args={[18, 0.04, 0.1]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Chân bàn bằng thép không gỉ */}
      {[[-8, -4], [8, -4], [-8, 4], [8, 4], [-3, -4], [3, -4], [-3, 4], [3, 4]].map(([x, z], i) => (
        <mesh key={i} receiveShadow castShadow position={[x, -1.8, z]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Chậu rửa (bồn inox) bên trái bàn */}
      <mesh position={[-6, -1.35, 3]}>
        <boxGeometry args={[1.2, 0.15, 0.8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Vòi nước */}
      <mesh position={[-6, -0.3, 3.45]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Đèn UV / ánh sáng trên bàn */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[8, 0.15, 0.4]} />
        <meshStandardMaterial color="#fefefe" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>

      {/* Kệ để dụng cụ phía sau */}
      <mesh position={[0, 0.3, -6]} receiveShadow castShadow>
        <boxGeometry args={[16, 0.15, 1.5]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Sàn gạch men trắng xám */}
      <mesh receiveShadow position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.05} />
      </mesh>
    </group>
  );

  const renderPhysicsRoom = () => (
    <group>
      <mesh position={[0, 5, -8]} receiveShadow>
        <boxGeometry args={[40, 15, 0.5]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>
      <group position={[0, 5, -7.7]}>
        <mesh receiveShadow>
          <planeGeometry args={[16, 6]} />
          <meshStandardMaterial color="#064e3b" roughness={0.9} />
        </mesh>
        {[[0, 3.1], [0, -3.1], [-8.1, 0], [8.1, 0]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.1]} receiveShadow>
            <boxGeometry args={[Math.abs(y) < 0.1 ? 16.4 : 0.2, Math.abs(x) < 0.1 ? 6.2 : 0.2, 0.2]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
          </mesh>
        ))}
      </group>
      <mesh receiveShadow castShadow position={[0, -1, 0]}>
        <boxGeometry args={[20, 0.4, 10]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      {[[-9, -4], [9, -4], [-9, 4], [9, 4]].map(([x, z], i) => (
        <mesh key={i} receiveShadow castShadow position={[x, -1.7, z]}>
          <boxGeometry args={[0.4, 1.2, 0.4]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh receiveShadow position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#d4a76a" roughness={0.5} />
      </mesh>
    </group>
  );

  const renderMathRoom = () => (
    <group>
      <mesh position={[0, 5, -8]} receiveShadow>
        <boxGeometry args={[40, 15, 0.5]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.7} />
      </mesh>
      <group position={[0, 5, -7.5]}>
        <mesh receiveShadow>
          <planeGeometry args={[18, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.3} transparent opacity={0.6} />
        </mesh>
        <gridHelper args={[18, 18, '#3b82f6', '#93c5fd']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} />
      </group>
      <mesh receiveShadow castShadow position={[0, -1, 0]}>
        <boxGeometry args={[22, 0.15, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.2} transparent opacity={0.5} />
      </mesh>
      {[[-10, -5], [10, -5], [-10, 5], [10, 5]].map(([x, z], i) => (
        <mesh key={i} receiveShadow castShadow position={[x, -1.75, z]}>
          <boxGeometry args={[0.3, 1.3, 0.3]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.8} />
        </mesh>
      ))}
      <mesh receiveShadow position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1e40af" roughness={0.7} />
      </mesh>
    </group>
  );

  return (
    <>
      {roomType === 'chemistry' && renderChemistryRoom()}
      {roomType === 'physics' && renderPhysicsRoom()}
      {roomType === 'math' && renderMathRoom()}
    </>
  );
};

export default React.memo(RoomEnvironment);
