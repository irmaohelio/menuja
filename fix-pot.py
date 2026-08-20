with open('src/components/SorveteBuilder.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the pot visualization section with a dynamic version
old_pot = """          {/* Pot Visualization */}
          <div className="flex justify-center mb-6">
            <svg width="100" height="120" viewBox="0 0 100 120">
              {/* Pot body */}
              <path d="M15 40 L25 110 L75 110 L85 40 Z" fill="#E8E8E8" stroke="#CCC" strokeWidth="2"/>
              {/* Pot rim */}
              <ellipse cx="50" cy="40" rx="40" ry="8" fill="#D4D4D4" stroke="#CCC" strokeWidth="2"/>
              
              {/* Scoops */}
              {scoopPositions.map((scoop, i) => (
                <g key={i}>
                  <circle
                    cx={scoop.x}
                    cy={scoop.y}
                    r="18"
                    fill={scoop.color}
                    stroke="#00000020"
                    strokeWidth="1"
                  />
                  <circle
                    cx={scoop.x - 5}
                    cy={scoop.y - 5}
                    r="4"
                    fill="#FFFFFF40"
                  />
                </g>
              ))}
              
              {/* Cobertura drip */}
              {cobertura && (
                <path
                  d="M30 40 Q35 50 30 60 M50 40 Q55 55 50 65 M70 40 Q75 50 70 60"
                  fill="none"
                  stroke={COBERTURAS.find(c => c.name === cobertura)?.color || '#000'}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>"""

new_pot = """          {/* Pot Visualization - Dynamic height based on scoops */}
          {(() => {
            const rows = Math.max(1, Math.ceil(totalScoops / 2))
            const scoopR = 18
            const scoopD = scoopR * 2
            const potRimY = 40
            const potBottomY = potRimY + rows * scoopD + 10
            const svgH = potBottomY + 20
            const potTopW = 70  // half-width at rim
            const potBotW = 50  // half-width at bottom
            const cx = 50

            // Calculate scoop positions - fill from bottom up, 2 per row
            const positions: { flavor: string; color: string; x: number; y: number }[] = []
            let idx = 0
            Object.entries(scoops).forEach(([flavor, qty]) => {
              const flavorData = SABORES.find(s => s.name === flavor)
              if (!flavorData) return
              for (let i = 0; i < qty; i++) {
                const row = Math.floor(idx / 2)
                const col = idx % 2
                const y = potBottomY - 10 - row * scoopD - scoopR
                const rowProgress = row / Math.max(1, rows - 1)
                const rowHalfW = potBotW + (potTopW - potBotW) * (1 - rowProgress) - scoopR
                const x = col === 0 ? cx - rowHalfW * 0.4 : cx + rowHalfW * 0.4
                positions.push({ flavor, color: flavorData.color, x, y })
                idx++
              }
            })

            return (
              <div className="flex justify-center mb-6">
                <svg width="160" height={svgH} viewBox={`0 0 100 ${svgH}`}>
                  {/* Pot body - trapezoid */}
                  <path
                    d={`M${cx - potTopW} ${potRimY} L${cx - potBotW} ${potBottomY} L${cx + potBotW} ${potBottomY} L${cx + potTopW} ${potRimY} Z`}
                    fill="#E8E8E8" stroke="#CCC" strokeWidth="2"
                  />
                  {/* Pot rim */}
                  <ellipse cx={cx} cy={potRimY} rx={potTopW} ry="8" fill="#D4D4D4" stroke="#CCC" strokeWidth="2"/>

                  {/* Scoops */}
                  {positions.map((scoop, i) => (
                    <g key={i}>
                      <circle cx={scoop.x} cy={scoop.y} r={scoopR} fill={scoop.color} stroke="#00000020" strokeWidth="1"/>
                      <circle cx={scoop.x - 5} cy={scoop.y - 5} r="4" fill="#FFFFFF40"/>
                    </g>
                  ))}

                  {/* Cobertura drip */}
                  {cobertura && (
                    <path
                      d={`M${cx - 20} ${potRimY} Q${cx - 15} ${potRimY + 10} ${cx - 20} ${potRimY + 20} M${cx} ${potRimY} Q${cx + 5} ${potRimY + 15} ${cx} ${potRimY + 25} M${cx + 20} ${potRimY} Q${cx + 25} ${potRimY + 10} ${cx + 20} ${potRimY + 20}`}
                      fill="none"
                      stroke={COBERTURAS.find(c => c.name === cobertura)?.color || '#000'}
                      strokeWidth="3" strokeLinecap="round"
                    />
                  )}
                </svg>
              </div>
            )
          })()}"""

content = content.replace(old_pot, new_pot)

with open('src/components/SorveteBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK - dynamic pot')
