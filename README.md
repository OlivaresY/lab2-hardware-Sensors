# Bitácora Geográfica Mobile App

A React Native mobile application built with **Expo**, **Expo Camera**, and **Expo Location** designed to capture real-time photo logs with linked GPS positioning.

---

## Prerequisites

Before starting, ensure your development machine and physical device have the following tools installed:

* **Node.js**: `v18.x` or `v20.x` LTS.
* **npm** or **yarn**: Included with Node.js.
* **Expo Go App**: Download from **App Store (iOS)** or **Google Play Store (Android)** on your physical mobile phone.
* **Network**: Mobile device and development host must be connected to the **same Wi-Fi network**.

---

## Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone [https://github.com/your-username/lab2-hardware-Sensors.git](https://github.com/your-username/lab2-hardware-Sensors.git)
   cd lab2-hardware-Sensors
   ```

2. **Install project dependencies**:

   ```bash
   npm install
   ```

---

## Execution & Physical Device Testing Guide

Executing and verifying native device sensor integrations (Camera & GPS) on a physical phone accounts for **20% of the grade evaluation**.

### Step 1: Launch Expo Development Server

Start the Metro bundler server with tunneling options enabled:

```bash
npx expo start
```

*If running across restricted or segmented local networks, launch with the tunnel flag:*

```bash
npx expo start --tunnel
```

### Step 2: Connect the Physical Device

* **Android**: Open the **Expo Go** app and scan the QR code generated in the terminal.
* **iOS**: Open the native **Camera App**, point at the QR code in the terminal, and open the prompted Expo link.

### Step 3: Hardware Sensor & Permission Verification

To verify full functionality for grading, complete the following test procedure:

| Test Step | Action | Expected Output | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **1. Initial Launch** | Grant Camera & Location prompts on screen | App redirects to `CaptureScreen` | Handled via `requestLocationPermissions` and `useCameraPermissions`. |
| **2. Photo Capture** | Tap **Abrir Cámara**, align view, press capture button | Live viewfinder renders and saves image | Image preview displays immediately with persistent retake controls. |
| **3. GPS Fetching** | Observe badge rendered over image overlay | Badge displays `Latitude, Longitude` | Lat/Long coordinates calculated via `Location.Accuracy.High`. |
| **4. Permission Fallback** | Disable Location in device settings & capture | Screen displays red **"Sin GPS"** badge | `getCurrentLocation` returns `null` gracefully without application crash. |
| **5. Log Persistence** | Fill Title & Description, tap **Guardar** | Redirects to **"Mi Bitácora"** (`/gallery`) | Item appears in list displaying image, title, GPS, and timestamp. |

---

## Project File Structure

```text
lab2-hardware-sensors/
├── app/
│   ├── _layout.tsx      # Root Expo Router navigation stack & context provider
│   ├── index.tsx        # Camera preview, capture form & GPS handling
│   └── gallery.tsx      # List view displaying saved geographic logs
├── context/
│   └── GeoLogContext.tsx # React Context managing persistent log state
├── utils/
│   └── permissions.ts   # Async helper for GPS requests and permission handling
├── types/
│   └── index.ts         # TypeScript interfaces for GeoLog models
├── app.json             # Expo config defining iOS/Android sensor permissions
└── package.json         # Project dependency manifest
```
