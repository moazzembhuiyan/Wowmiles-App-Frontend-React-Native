<div align="center">

<img src=".github/banner.svg" width="100%" alt="WowMiles — Travel. Earn. Repeat." />

<p><b>📱 Cross-platform Mobile App · iOS & Android</b></p>

<p>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NativeWind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="NativeWind" />
</p>

</div>

## 📖 Overview

**WowMiles** is a travel loyalty app built with **React Native & Expo**. Travel agents register the bookings they already make, and once approved they earn **WowMiles** that can be redeemed for rewards, vouchers and tier benefits — all in a smooth, modern mobile experience.

## ✨ Key Features

### 🔐 Onboarding & Authentication

- Animated onboarding screens
- Sign up, login, OTP verification, forgot & reset password
- Agency registration with **pending / approved / rejected** account states

### ✈️ Bookings & Miles

- Register travel bookings and track their approval
- Live miles balance & full earning history
- Loyalty tiers with tier-benefit breakdown

### 🎁 Rewards

- Browse rewards and reward details
- Redeem miles with confirmation flow
- Vouchers & redemption history
- Partner listings

### 📚 More

- Academy & events tabs
- In-app notifications with detail view
- Profile management
- Bottom-tab navigation with file-based routing

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React Native 0.88 · Expo SDK 58 |
| **Language** | TypeScript |
| **Navigation** | Expo Router (file-based) · React Navigation bottom tabs |
| **Styling** | NativeWind (Tailwind CSS for React Native) · Expo Linear Gradient · Expo Blur |
| **Animation** | React Native Reanimated · Gesture Handler |
| **Utilities** | Expo Print · Sharing · Clipboard · Document Picker |
| **Icons** | Lucide React Native · React Native SVG |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- [Expo Go](https://expo.dev/go) on your phone, or an Android emulator / iOS simulator

### Installation

```bash
git clone https://github.com/moazzembhuiyan/wowmiles-app-frontend-react-native.git
cd wowmiles-app-frontend-react-native
npm install
```

### Run

```bash
npx expo start
# press a → Android · i → iOS · w → Web, or scan the QR code with Expo Go
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run start` | Start the Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run in the browser |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```text
src/
├── app/
│   ├── (auth)/        # Onboarding, login, signup, OTP, agency, pending/rejected
│   ├── (tabs)/        # Home, bookings, academy, events, profile
│   ├── rewards.tsx    # Rewards, vouchers, miles, loyalty & tiers
│   └── ...
└── components/        # Reusable UI components
assets/                # Fonts & images
```

---

<div align="center">

### 👨‍💻 Developed by [Moazzem Hossen Bhuiyan](https://github.com/moazzembhuiyan)

<sub>Mobile App Developer (React Native) • Web Developer</sub>

<p>
  <a href="https://github.com/moazzembhuiyan"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://www.linkedin.com/in/moazzem-hossen-bhuiyan-325432331/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="mailto:moazzembhuiyan394@gmail.com"><img src="https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email" /></a>
</p>

<sub>⭐ If you like this project, consider giving it a star!</sub>

</div>
