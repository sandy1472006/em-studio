# EM Studio — Interactive Electromagnetic Engineering Laboratory

[![Vitest](https://img.shields.io/badge/tests-20%20passed-success?style=flat-square&logo=vitest)](https://vitest.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**EM Studio** is an interactive, browser-based computational electromagnetics workbench designed for third-year Electronics and Telecommunication Engineering students studying Electromagnetic Engineering (EME).

It provides three focused scientific laboratories sharing a unified instrumentation design system, rigorous numerical engines, real-time 3D vector visualisations, analytical benchmarks, and an academic laboratory report generator.

---

## 🏛️ The Three Laboratories

### 1. Electrostatics Lab
- **Physics**: Coulomb's law, superposition principle, scalar potential $V(\mathbf{r})$, flux density $\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}$, and singularity detection.
- **Runge-Kutta 4th-Order (RK4) Field Lines**: Numerical integration of normalized $\mathbf{E}/|\mathbf{E}|$ field lines seeded radially around charges.
- **2D Potential Slicing**: Planar potential contour texture mapped directly in 3D space.
- **Laplace Equation Solver**: Finite-difference 2D boundary value problem (BVP) solver for $\nabla^2 V = 0$ with configurable boundary voltages, grid resolution (up to $50\times 50$), and Successive Over-Relaxation (SOR) with residual convergence tracking.
- **Bench Presets**: Single positive charge, Electric dipole, Symmetric quadrupole, Three-charge asymmetric arrangement.

### 2. Wave Propagation Lab
- **Physics**: Time-harmonic uniform plane waves (UPW) under $e^{j\omega t}$ convention. Complex propagation constant $\gamma = \sqrt{j\omega\mu(\sigma + j\omega\varepsilon)} = \alpha + j\beta$, phase velocity $v_p = \omega/\beta$, wavelength $\lambda = 2\pi/\beta$, complex intrinsic impedance $\eta = |\eta|e^{j\theta_\eta}$, and skin depth $\delta = 1/\alpha$.
- **3D Animated Plane Wave Scene**:
  - Transverse Electric field $\mathbf{E}$ vectors (restrained cyan `#55C8DD`).
  - Orthogonal Magnetic field $\mathbf{H}$ vectors (amber `#D4A843`).
  - Instantaneous and time-averaged Poynting vector $\mathbf{S} = \mathbf{E} \times \mathbf{H}$ (green `#4CAF50`).
- **Polarisation Modes**: Linear, Right-Hand Circular (RHCP), Left-Hand Circular (LHCP), and Elliptical (axial ratio $E_y/E_x$ & phase difference $\phi$).
- **Material Models**: Free space, Lossless dielectric (glass), Lossy dielectric (wet earth), Good conductor (copper).
- **Scientific Plots**: Spatial waveform $E(z)$, Polarisation Lissajous trajectory, Attenuation & skin depth decay envelope.

### 3. Transmission Line Lab
- **Physics**: Telegrapher's wave interference. Complex voltage reflection coefficient $\Gamma_L = (Z_L - Z_0)/(Z_L + Z_0)$, Voltage Standing Wave Ratio $\text{VSWR} = (1 + |\Gamma_L|)/(1 - |\Gamma_L|)$, Return Loss $\text{RL} = -20\log_{10}|\Gamma_L|$, Mismatch Loss $\text{ML} = -10\log_{10}(1 - |\Gamma_L|^2)$, and generalized input impedance $Z_{\text{in}}(d)$.
- **1D Interferometer Canvas**:
  - Horizontal line layout with RF continuous-wave generator on the left and load termination $Z_L$ on the right.
  - Forward incident wave indicator $V^+ \rightarrow$ and reverse reflected wave indicator $\leftarrow V^-$.
  - Animated interference wave $V(d, t)$ oscillating within the standing wave envelope $|V(d)|$.
  - Click-to-position impedance probe measuring $Z_{\text{in}}(d)$ anywhere along the line.
- **Scientific Plots**: Standing wave patterns with $V_{\max}/V_{\min}$ extrema detection, and broadband frequency sweep (100 MHz – 3 GHz).

---

## 🔬 Scientific Features

- **AI Physics Tutor & Theory Assistant**: Offline, verified theory engine providing context-aware answers to core engineering questions using the **actual live parameters** from the simulation.
- **Laboratory Report Generator**: Produces complete academic reports with KaTeX equations, SI parameters table, numerical measurements, analytical benchmark status, and error analysis. Includes one-click printable PDF formatting and CSV table exports.
- **Experiment Manager**: Save, restore, and compare experiment records in `localStorage` with JSON and CSV exports.

---

## 🧪 Automated Verification Suite

EM Studio features **20 automated analytical unit tests** verified in Vitest:

```bash
npm test
```

```
✓ src/tests/electrostatics.test.ts (7 tests)
  - Single positive charge field direction
  - Field reversal with charge sign inversion
  - Field proportionality to charge magnitude
  - Inverse-square law (1/r² factor of 4 reduction)
  - Dipole superposition reinforcement
  - Quadrupole symmetry invariance
  - Analytical Coulomb benchmark

✓ src/tests/wave.test.ts (6 tests)
  - Free-space wavelength λ = c/f at 1 GHz
  - Zero attenuation (α = 0) in lossless dielectric
  - Phase velocity in dielectric vp = c / √εr
  - Exponential attenuation in lossy medium
  - Good conductor skin depth approximation
  - Vector orthogonality: E · H = 0 and E × H in +z

✓ src/tests/transmissionLine.test.ts (7 tests)
  - Matched load: |Γ| = 0, VSWR = 1.0000
  - Open circuit: |Γ| = 1.0000, VSWR → ∞
  - Short circuit: |Γ| = 1.0000, ∠Γ = 180°
  - Resistive mismatch (100Ω on 50Ω): Γ = 1/3, VSWR = 2.000
  - Quarter-wave transformer: Zin = Z0² / ZL
  - Standing wave envelope Vmax / Vmin = VSWR
  - Half-wavelength line invariance: Zin(λ/2) = ZL
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or yarn or pnpm

### Installation
```bash
git clone https://github.com/sandy1472006/em-studio.git
cd em-studio
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Free Hosting Options

### Option 1: GitHub Pages (Automated Workflow)
A GitHub Actions workflow is included at `.github/workflows/deploy.yml`. Once pushed, enable GitHub Pages in your repository:
1. Go to **Settings** > **Pages** in this GitHub repository.
2. Under **Build and deployment**, select **Source: GitHub Actions**.
3. Every push to `main` will automatically build and publish your site!

### Option 2: Vercel / Netlify
1. Connect your GitHub repository to [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`

---

## 🛠️ Technology Stack
- **Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Math Typesetting**: KaTeX
- **Unit Testing**: Vitest
- **Icons**: Lucide React
