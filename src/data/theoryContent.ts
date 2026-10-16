export interface ModuleTheory {
  title: string;
  topic: string;
  equations: {
    name: string;
    latex: string;
    description: string;
    variables: { symbol: string; meaning: string; unit: string }[];
  }[];
  assumptions: string[];
  limitations: string[];
  methodNotes: string;
}

export const theoryDatabase: Record<string, ModuleTheory> = {
  electrostatics: {
    title: 'Electrostatics Laboratory',
    topic: 'Coulomb’s Law, Gauss’s Law, Electric Potential & Laplace’s Equation',
    equations: [
      {
        name: 'Coulomb’s Law (Superposition for Point Charges)',
        latex: '\\mathbf{E}(\\mathbf{r}) = \\frac{1}{4\\pi\\varepsilon_0\\varepsilon_r} \\sum_{i=1}^N q_i \\frac{\\mathbf{r} - \\mathbf{r}_i}{|\\mathbf{r} - \\mathbf{r}_i|^3}',
        description: 'Electric field intensity at position r produced by a discrete distribution of N point charges in a linear, homogeneous dielectric.',
        variables: [
          { symbol: 'E', meaning: 'Electric Field Intensity', unit: 'V/m (or N/C)' },
          { symbol: 'q_i', meaning: 'Source Charge Magnitude', unit: 'C (Coulombs)' },
          { symbol: 'r - r_i', meaning: 'Displacement vector from source to observation point', unit: 'm' },
          { symbol: '\\varepsilon_0', meaning: 'Permittivity of Free Space (8.854 × 10⁻¹²)', unit: 'F/m' },
          { symbol: '\\varepsilon_r', meaning: 'Relative Permittivity (Dielectric Constant)', unit: 'dimensionless' },
        ],
      },
      {
        name: 'Electric Potential (Superposition)',
        latex: 'V(\\mathbf{r}) = \\frac{1}{4\\pi\\varepsilon_0\\varepsilon_r} \\sum_{i=1}^N \\frac{q_i}{|\\mathbf{r} - \\mathbf{r}_i|}',
        description: 'Work done per unit charge bringing a positive test charge from infinity to position r. Related to electric field by E = -∇V.',
        variables: [
          { symbol: 'V', meaning: 'Electric Scalar Potential', unit: 'V (Volts)' },
          { symbol: '\\mathbf{E} = -\\nabla V', meaning: 'Field as conservative potential gradient', unit: 'V/m' },
        ],
      },
      {
        name: 'Electric Flux Density (Constitutive Relation)',
        latex: '\\mathbf{D} = \\varepsilon \\mathbf{E} = \\varepsilon_0 \\varepsilon_r \\mathbf{E}',
        description: 'Displacement field accounting for bound polarization charges in dielectric material.',
        variables: [
          { symbol: 'D', meaning: 'Electric Flux Density', unit: 'C/m²' },
        ],
      },
      {
        name: 'Laplace’s Equation (Charge-Free Region)',
        latex: '\\nabla^2 V = \\frac{\\partial^2 V}{\\partial x^2} + \\frac{\\partial^2 V}{\\partial y^2} = 0',
        description: 'Governs static electric potential in regions with zero volume charge density (ρ_v = 0) with prescribed Dirichlet boundary conditions.',
        variables: [
          { symbol: '\\nabla^2', meaning: 'Laplacian differential operator', unit: 'm⁻²' },
        ],
      },
      {
        name: 'Finite-Difference Discretization (Successive Over-Relaxation)',
        latex: 'V_{i,j}^{(k+1)} = (1 - \\omega)V_{i,j}^{(k)} + \\frac{\\omega}{4}\\left(V_{i+1,j}^{(k)} + V_{i-1,j}^{(k+1)} + V_{i,j+1}^{(k)} + V_{i,j-1}^{(k+1)}\\right)',
        description: 'Iterative numerical solution of 2D Laplace equation with acceleration parameter ω ∈ (1, 2).',
        variables: [
          { symbol: '\\omega', meaning: 'SOR relaxation factor (optimal ≈ 1.2 – 1.8)', unit: 'dimensionless' },
        ],
      },
    ],
    assumptions: [
      'Charges are idealized zero-radius mathematical point charges.',
      'Medium is isotropic, linear, homogeneous and infinite in extent.',
      'Quasi-static condition: no time-varying magnetic fields (∂B/∂t = 0), so ∇ × E = 0.',
      'Numerical field lines are integrated using 4th-order Runge-Kutta (RK4) vector tracing.',
      'Laplace solver assumes a closed rectangular domain with Dirichlet voltage boundaries.',
    ],
    limitations: [
      'Singularity at |r - r_i| → 0 where analytical E-field diverges to infinity; software clamps calculation to prevent division by zero.',
      'Field-line count indicates directional topology rather than continuous flux density in 3D space.',
    ],
    methodNotes: 'Numerical field lines are seeded radially at fixed radius r_0 around positive charges and integrated along normalized unit vector E/|E| using step-controlled RK4 until domain bounds or opposite charges are encountered.',
  },

  'wave-propagation': {
    title: 'Wave Propagation Laboratory',
    topic: 'Time-Harmonic Maxwell’s Equations, Plane Waves, Polarisation & Complex Loss',
    equations: [
      {
        name: 'Helmholtz Wave Equation (Lossy Medium)',
        latex: '\\nabla^2 \\mathbf{E} - \\gamma^2 \\mathbf{E} = 0, \\quad \\gamma = \\sqrt{j\\omega\\mu(\\sigma + j\\omega\\varepsilon)} = \\alpha + j\\beta',
        description: 'Time-harmonic vector wave equation derived from Maxwell’s curl equations assuming e^(jωt) time convention.',
        variables: [
          { symbol: '\\gamma', meaning: 'Complex Propagation Constant', unit: 'm⁻¹' },
          { symbol: '\\alpha', meaning: 'Attenuation Constant', unit: 'Np/m (Nepers per meter)' },
          { symbol: '\\beta', meaning: 'Phase Constant', unit: 'rad/m' },
          { symbol: '\\sigma', meaning: 'Material Electrical Conductivity', unit: 'S/m' },
          { symbol: '\\omega = 2\\pi f', meaning: 'Angular Frequency', unit: 'rad/s' },
        ],
      },
      {
        name: 'Phase Velocity & Wavelength',
        latex: 'v_p = \\frac{\\omega}{\\beta}, \\quad \\lambda = \\frac{2\\pi}{\\beta} = \\frac{v_p}{f}',
        description: 'Rate at which phase of wave propagates through the medium and spatial period.',
        variables: [
          { symbol: 'v_p', meaning: 'Phase Velocity', unit: 'm/s' },
          { symbol: '\\lambda', meaning: 'Wavelength in Medium', unit: 'm' },
        ],
      },
      {
        name: 'Complex Intrinsic Impedance',
        latex: '\\eta = \\sqrt{\\frac{j\\omega\\mu}{\\sigma + j\\omega\\varepsilon}} = |\\eta| e^{j\\theta_\\eta}',
        description: 'Ratio of transverse electric field to transverse magnetic field: H = (1/η)(k̂ × E). In free space, η₀ ≈ 376.73 Ω.',
        variables: [
          { symbol: '\\eta', meaning: 'Intrinsic Wave Impedance', unit: 'Ω (Ohms)' },
        ],
      },
      {
        name: 'Skin Depth (Attenuation Depth)',
        latex: '\\delta = \\frac{1}{\\alpha}, \\quad \\delta_{\\text{good conductor}} \\approx \\sqrt{\\frac{2}{\\omega\\mu\\sigma}}',
        description: 'Propagation distance over which wave amplitude decreases by factor of 1/e (≈ 36.8%, or -8.686 dB).',
        variables: [
          { symbol: '\\delta', meaning: 'Skin Depth', unit: 'm' },
        ],
      },
      {
        name: 'Poynting Vector & Power Flow',
        latex: '\\mathbf{S} = \\mathbf{E} \\times \\mathbf{H}, \\quad \\langle\\mathbf{S}\\rangle = \\frac{1}{2} \\text{Re}\\{\\mathbf{E} \\times \\mathbf{H}^*\\} = \\frac{|E_0|^2}{2|\\eta|} e^{-2\\alpha z} \\cos(\\theta_\\eta) \\hat{\\mathbf{z}}',
        description: 'Instantaneous and time-averaged electromagnetic power density vector pointing in propagation direction.',
        variables: [
          { symbol: 'S', meaning: 'Instantaneous Poynting Vector', unit: 'W/m²' },
          { symbol: '\\langle S \\rangle', meaning: 'Time-Averaged Power Density', unit: 'W/m²' },
        ],
      },
    ],
    assumptions: [
      'Uniform plane wave (UPW) propagating in +z direction: no variations in x or y (∂/∂x = ∂/∂y = 0).',
      'Medium is linear, isotropic, homogeneous and non-dispersive at operating frequency.',
      'Engineering time-harmonic convention: fields vary as e^(+jωt).',
      'Poynting vector calculated from physical E and H field vectors with exact orthogonal cross-product.',
    ],
    limitations: [
      'Idealized plane wave model is unphysical in boundless space (infinite total energy) but accurately models far-field antenna and optical propagation.',
    ],
    methodNotes: 'Field components are computed analytically for every coordinate z and animated over time parameter t = (clock * speed). Both electric vector (cyan) and magnetic vector (amber) satisfy E × H = S_z > 0.',
  },

  'transmission-line': {
    title: 'Transmission Line Laboratory',
    topic: 'Telegrapher’s Equations, Reflection Coefficient, Standing Waves & Impedance Matching',
    equations: [
      {
        name: 'Load Voltage Reflection Coefficient',
        latex: '\\Gamma_L = \\frac{Z_L - Z_0}{Z_L + Z_0} = |\\Gamma_L| e^{j\\theta_\\Gamma}',
        description: 'Fraction of incident voltage wave reflected at the termination load.',
        variables: [
          { symbol: '\\Gamma_L', meaning: 'Complex Voltage Reflection Coefficient', unit: 'dimensionless' },
          { symbol: 'Z_0', meaning: 'Characteristic Impedance of Line', unit: 'Ω (Ohms)' },
          { symbol: 'Z_L = R_L + jX_L', meaning: 'Complex Load Impedance', unit: 'Ω' },
        ],
      },
      {
        name: 'Voltage Standing Wave Ratio (VSWR)',
        latex: '\\text{VSWR} = s = \\frac{V_{\\max}}{V_{\\min}} = \\frac{1 + |\\Gamma_L|}{1 - |\\Gamma_L|} \\quad (1 \\le s < \\infty)',
        description: 'Ratio of maximum standing wave voltage envelope to minimum standing wave voltage envelope.',
        variables: [
          { symbol: 's', meaning: 'VSWR', unit: 'dimensionless (ratio)' },
          { symbol: 'V_{\\max} = |V_0^+|(1 + |\\Gamma|)', meaning: 'Voltage Maximum', unit: 'V' },
          { symbol: 'V_{\\min} = |V_0^+|(1 - |\\Gamma|)', meaning: 'Voltage Minimum', unit: 'V' },
        ],
      },
      {
        name: 'Input Impedance (Lossless Line)',
        latex: 'Z_{\\text{in}}(d) = Z_0 \\frac{Z_L + j Z_0 \\tan(\\beta d)}{Z_0 + j Z_L \\tan(\\beta d)}',
        description: 'Equivalent driving-point impedance looking toward load at distance d from termination.',
        variables: [
          { symbol: 'Z_{\\text{in}}', meaning: 'Input Impedance', unit: 'Ω' },
          { symbol: 'd', meaning: 'Distance measured from load toward generator', unit: 'm' },
          { symbol: '\\beta = 2\\pi / \\lambda', meaning: 'Phase Constant on line', unit: 'rad/m' },
        ],
      },
      {
        name: 'Total Voltage and Current Distributions',
        latex: 'V(d) = V_0^+ \\left( e^{j\\beta d} + \\Gamma_L e^{-j\\beta d} \\right), \\quad I(d) = \\frac{V_0^+}{Z_0} \\left( e^{j\\beta d} - \\Gamma_L e^{-j\\beta d} \\right)',
        description: 'Superposition of forward-traveling incident wave and reverse-traveling reflected wave along transmission line.',
        variables: [
          { symbol: 'V(d)', meaning: 'Total Voltage phasor at distance d', unit: 'V' },
          { symbol: 'I(d)', meaning: 'Total Current phasor at distance d', unit: 'A' },
        ],
      },
      {
        name: 'Return Loss & Mismatch Loss',
        latex: '\\text{RL} = -20\\log_{10}|\\Gamma_L| \\text{ dB}, \\quad \\text{ML} = -10\\log_{10}(1 - |\\Gamma_L|^2) \\text{ dB}',
        description: 'Decibel metrics quantifying power reflection and power transmission efficiency into the load.',
        variables: [
          { symbol: 'RL', meaning: 'Return Loss (higher is better match)', unit: 'dB' },
          { symbol: 'ML', meaning: 'Mismatch Loss', unit: 'dB' },
        ],
      },
    ],
    assumptions: [
      'Transverse Electromagnetic (TEM) mode propagation on two-conductor transmission structure.',
      'Lossless dielectric line section (R = 0, G = 0, α = 0) unless explicit loss is activated.',
      'Single frequency continuous-wave (CW) steady-state sinusoidal excitation.',
    ],
    limitations: [
      'High-frequency parasitic radiation and higher-order waveguide modes (TE/TM) are not modeled.',
      'At exactly |Γ| = 1, VSWR is mathematically infinite (ideal open/short).',
    ],
    methodNotes: 'Voltage envelope |V(d)| and current envelope |I(d)| are computed from exact interference equations without approximations. Special cases (quarter-wave transformer at bl = π/2 and half-wave line at bl = π) are preserved with analytical limit checks.',
  },
};
