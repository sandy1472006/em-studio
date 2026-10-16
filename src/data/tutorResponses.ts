export interface TutorQuestion {
  id: string;
  question: string;
  category: string;
  module: 'electrostatics' | 'wave-propagation' | 'transmission-line' | 'general';
  generateAnswer: (params: Record<string, any>, results: Record<string, any>) => string;
}

export const tutorQuestionsDatabase: TutorQuestion[] = [
  // Electrostatics
  {
    id: 'es-q1',
    question: 'Why does the electric field change after a charge is moved?',
    category: 'Field Theory',
    module: 'electrostatics',
    generateAnswer: (params, results) => {
      const er = params.relativePermittivity ?? 1.0;
      const count = params.charges?.length ?? 2;
      const E_mag = results?.magnitude ? results.magnitude.toExponential(3) : 'N/A';
      return `According to Coulomb’s law, the electric field from each point charge decays with the square of the distance:
E_i = [q_i / (4πε₀ε_r)] × (r - r_i) / |r - r_i|³.

When you move a charge, two things change simultaneously:
1. The distance vector (r - r_i) changes magnitude, scaling the field strength inversely with distance squared (1/R²).
2. The unit vector pointing from the source to the observation point rotates, redirecting the field component along x, y, and z.

In your current setup with ${count} charge(s) in medium with ε_r = ${er}, the net field at the observation point is the vector sum (superposition):
E_total = Σ E_i = ${E_mag} V/m.
Any displacement changes the relative vector cancellation or reinforcement between opposing charges.`;
    },
  },
  {
    id: 'es-q2',
    question: 'What is the relationship between electric field lines and equipotential surfaces?',
    category: 'Potential Theory',
    module: 'electrostatics',
    generateAnswer: () => {
      return `Electric field lines and equipotential surfaces are strictly orthogonal (perpendicular) everywhere:
E = -∇V.

Why this must be true:
An equipotential surface has dV = 0 everywhere along its surface. The differential change in potential is:
dV = -E · dr = 0.
For the dot product of two non-zero vectors to vanish, E must be perpendicular to the displacement vector dr tangential to the surface.
Furthermore, the minus sign indicates that the electric field vector always points in the direction of maximum rate of potential decrease.`;
    },
  },
  {
    id: 'es-q3',
    question: 'How does the Laplace solver compute voltage in the absence of free charge?',
    category: 'Numerical Methods',
    module: 'electrostatics',
    generateAnswer: (params, results) => {
      const iter = results?.iterations ?? 'converged';
      const res = results?.residual ? results.residual.toExponential(3) : '1e-5';
      return `In a charge-free dielectric region (ρ_v = 0), Gauss’s law ∇ · D = 0 simplifies to Laplace’s equation:
∇²V = ∂²V/∂x² + ∂²V/∂y² = 0.

By replacing continuous partial derivatives with Taylor series finite differences on a 2D mesh:
(V[i+1,j] - 2V[i,j] + V[i-1,j]) / Δx² + (V[i,j+1] - 2V[i,j] + V[i,j-1]) / Δy² = 0.
For equal grid spacing Δx = Δy, this yields the discrete Mean Value Theorem:
V[i,j] = (V[i+1,j] + V[i-1,j] + V[i,j+1] + V[i,j-1]) / 4.

The potential at any interior node is simply the average of its four immediate neighbors! The SOR algorithm accelerates convergence with over-relaxation factor ω. Your current solve required ${iter} iterations to reach a residual of ${res}.`;
    },
  },

  // Wave Propagation
  {
    id: 'wp-q1',
    question: 'How does increasing frequency affect wavelength in free space?',
    category: 'Wave Dynamics',
    module: 'wave-propagation',
    generateAnswer: (params, results) => {
      const f = params.frequency ? (params.frequency / 1e9).toFixed(2) + ' GHz' : '1.00 GHz';
      const lambda = results?.wavelength ? (results.wavelength * 100).toFixed(2) + ' cm' : '30.00 cm';
      const vp = results?.phaseVelocity ? (results.phaseVelocity / 1e8).toFixed(2) + ' × 10⁸ m/s' : '3.00 × 10⁸ m/s';
      return `In any homogeneous medium, phase velocity is determined by constitutive parameters:
v_p = 1 / √(με) = c / √(ε_r μ_r).

Because phase velocity v_p is constant with respect to frequency in non-dispersive media (currently ${vp}), wavelength is inversely proportional to frequency:
λ = v_p / f.

At your current frequency f = ${f}, the spatial wavelength is λ = ${lambda}.
If you double the frequency (e.g., from 1 GHz to 2 GHz), the spatial cycle length λ compresses by exactly 50% (from 30 cm down to 15 cm).`;
    },
  },
  {
    id: 'wp-q2',
    question: 'Why does a conductor attenuate electromagnetic waves?',
    category: 'Material Losses',
    module: 'wave-propagation',
    generateAnswer: (params, results) => {
      const sigma = params.material?.conductivity ?? 0;
      const alpha = results?.alpha ? results.alpha.toExponential(3) : '0';
      const delta = results?.skinDepth ? (results.skinDepth * 1e6).toFixed(2) + ' µm' : 'N/A';
      return `In a conducting material (conductivity σ > 0), the oscillating electric field accelerates free conduction electrons, establishing an electric conduction current density:
J_c = σE.

By Joule heating (P_loss = J · E = σ|E|²), the electromagnetic field continuously transfers its kinetic energy into thermal lattice vibrations.
From the complex Helmholtz wave equation:
γ = √(jωμ(σ + jωε)) = α + jβ.
When σ >> ωε (good conductor condition), the attenuation constant becomes:
α ≈ √(ωμσ / 2) (currently α = ${alpha} Np/m).

The field decays exponentially as E(z) = E₀ exp(-αz). The characteristic skin depth δ = 1/α is ${delta}, showing why high-frequency currents are restricted to thin surface layers.`;
    },
  },
  {
    id: 'wp-q3',
    question: 'What is the physical meaning of the Poynting vector?',
    category: 'Electromagnetic Power',
    module: 'wave-propagation',
    generateAnswer: (params, results) => {
      const pol = params.polarisation ?? 'linear';
      const eta = results?.intrinsicImpedance?.real ? results.intrinsicImpedance.real.toFixed(1) + ' Ω' : '376.7 Ω';
      return `The Poynting vector represents instantaneous directional electromagnetic power flux density:
S = E × H [W/m²].

Key physical takeaways:
1. Direction: The vector cross-product E × H points in the direction of net energy propagation (+z axis in this lab).
2. Orthogonality: In a uniform plane wave, E, H, and S form a right-handed orthogonal triad (E ⊥ H ⊥ S).
3. Complex Impedance: The electric field E and magnetic field H are coupled via intrinsic wave impedance η = ${eta}.
4. Time Average: For sinusoidal fields in lossless media, the time-averaged power is <S> = |E|² / (2|η|). For your current ${pol} wave, power flows continuously down the z-axis.`;
    },
  },

  // Transmission Line
  {
    id: 'tl-q1',
    question: 'Why does a load mismatch produce a reflected wave?',
    category: 'Reflection Theory',
    module: 'transmission-line',
    generateAnswer: (params, results) => {
      const Z0 = params.characteristicImpedance ?? 50;
      const RL = params.loadResistance ?? 50;
      const XL = params.loadReactance ?? 0;
      const gamma = results?.gammaMagnitude !== undefined ? results.gammaMagnitude.toFixed(4) : '0.0000';
      const vswr = results?.vswr !== undefined ? (results.vswr === Infinity ? '∞' : results.vswr.toFixed(3)) : '1.000';
      return `A transmission line has a characteristic impedance Z₀ = √(L/C) that defines the exact ratio of voltage to current required for a unidirectional traveling wave:
V⁺ / I⁺ = Z₀ (currently ${Z0} Ω).

When the wave arrives at the load termination Z_L = ${RL} + j(${XL}) Ω, boundary conditions demand that the total terminal voltage and terminal current must satisfy Ohm’s law:
V_total / I_total = Z_L.

If Z_L ≠ Z₀, a single incident wave CANNOT satisfy both the line relationship (V⁺/I⁺ = Z₀) and the load relationship (V_L/I_L = Z_L) simultaneously!
Physics resolves this mismatch by launching a reverse-traveling reflected wave (V⁻, I⁻ = -V⁻/Z₀) such that:
(V⁺ + V⁻) / (I⁺ + I⁻) = Z_L.

The load reflection coefficient is:
Γ = (Z_L - Z₀) / (Z_L + Z₀) = ${gamma}.
The interference between V⁺ and V⁻ creates the standing wave with VSWR = ${vswr}.`;
    },
  },
  {
    id: 'tl-q2',
    question: 'What is the difference between Return Loss and Insertion Loss?',
    category: 'RF Metrics',
    module: 'transmission-line',
    generateAnswer: (params, results) => {
      const gamma = results?.gammaMagnitude ?? 0;
      const rl = results?.returnLoss !== undefined ? (results.returnLoss === Infinity ? '∞ (perfect)' : results.returnLoss.toFixed(2) + ' dB') : 'N/A';
      const ml = results?.mismatchLoss !== undefined ? results.mismatchLoss.toFixed(2) + ' dB' : 'N/A';
      return `Both are logarithmic decibel metrics used in RF engineering, but describe different power ratios:

1. Return Loss (RL):
RL = -20 log₁₀|Γ| (current setup: ${rl}).
Measures how much power is NOT reflected. A higher Return Loss indicates a better impedance match. For a matched load (|Γ|=0), RL = ∞ dB. In industry, RL > 15–20 dB is considered good matching.

2. Mismatch Loss (ML):
ML = -10 log₁₀(1 - |Γ|²) (current setup: ${ml}).
Measures the actual reduction in transmitted power delivered to the load due to reflection. For a matched load, ML = 0 dB (100% transmitted).`;
    },
  },
  {
    id: 'tl-q3',
    question: 'How does a quarter-wave (λ/4) transformer achieve impedance matching?',
    category: 'Impedance Matching',
    module: 'transmission-line',
    generateAnswer: (params) => {
      const Z0 = params.characteristicImpedance ?? 50;
      const RL = params.loadResistance ?? 100;
      const Z_match = Math.sqrt(Z0 * RL).toFixed(2);
      return `At an electrical distance d = λ/4, the phase delay is βd = (2π/λ)(λ/4) = π/2 radians (90°).
Substituting tan(π/2) → ∞ into the input impedance formula:
Z_in = Z_line² / Z_L.

This is the famous Quarter-Wave Inversion property:
- A high resistance transforms into a low resistance.
- An open circuit (Z_L = ∞) transforms into an electrical short (Z_in = 0).
- A short circuit (Z_L = 0) transforms into an open circuit (Z_in = ∞).

To match a load R_L = ${RL} Ω to your main line Z₀ = ${Z0} Ω, you insert a quarter-wavelength section with characteristic impedance:
Z_transformer = √(Z₀ × R_L) = √(${Z0} × ${RL}) = ${Z_match} Ω.
Looking into this transformer section, the generator sees exactly ${Z0} Ω!`;
    },
  },
  {
    id: 'gen-q1',
    question: 'What analytical verification tests have been conducted on this laboratory?',
    category: 'Verification & Quality',
    module: 'general',
    generateAnswer: () => {
      return `EM Studio implements 18 automated scientific verification tests based on analytical electromagnetic theory:

Electrostatics:
1. Field direction away from positive charge (+x test)
2. Exact vector reversal under charge sign inversion
3. Field proportionality under charge scaling (|E(2q)| = 2|E(q)|)
4. Inverse-square law (|E(r)| / |E(2r)| = 4.000)
5. Superposition reinforcement on electric dipole
6. Symmetry invariance on quadrupole geometry
7. Analytical Coulomb benchmark vs 1/(4πε₀)

Wave Propagation:
8. Free space wavelength λ = c/f at 1 GHz
9. Zero attenuation (α = 0) in ideal lossless dielectric
10. Dielectric phase velocity v_p = c / √ε_r
11. Exponential attenuation profile in lossy medium
12. Skin depth agreement with good conductor approximation
13. Vector orthogonality: E · H = 0 and E × H in +z direction

Transmission Lines:
14. Matched termination: Γ = 0, VSWR = 1.0000
15. Open circuit: |Γ| = 1.0000, VSWR → ∞, phase = 0°
16. Short circuit: |Γ| = 1.0000, VSWR → ∞, phase = 180°
17. Resistive mismatch (100Ω / 50Ω): Γ = 1/3, VSWR = 2.000
18. Half-wavelength invariance: Z_in(λ/2) = Z_L`;
    },
  },
];
