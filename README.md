# Pass US Citizen Interview with AI

A comprehensive React Native Expo app designed to help users prepare for the US citizenship interview process with AI-powered features.

## 🚀 Features

- **AI Mock Interview**: Practice speaking skills with voice recognition
- **Flashcard Mode**: Interactive learning with 100 civics questions
- **Story Mode**: Learn through engaging American Adventure stories
- **Practice Tests**: Timed quizzes with weakness tracking
- **Multi-language Support**: 9 languages (English, Spanish, Korean, etc.)
- **Progress Tracking**: Monitor your learning journey
- **Audio Learning**: Learn while driving with TTS
- **N400 Practice**: Form-specific preparation

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- Expo account (free at expo.dev)

## 🛠 Installation & Setup

### Option 1: Clone from Expo (Recommended)
```bash
# Login to Expo
eas login

# Clone the project
npx create-expo-app --template blank CitizenTestAi
cd CitizenTestAi

# Link to existing project
eas init --id 24f53ef8-59f1-4d5c-99ad-145f9ebafda0
```

### Option 2: Manual Setup
```bash
# Clone repository
git clone <repository-url>
cd CitizenTestAi

# Install dependencies
npm install

# Login to Expo
eas login

# Start development server
npx expo start
```

## 🔄 Development Workflow

### Daily Development
```bash
# Start development server
npx expo start

# Push updates to Expo (auto-syncs with GitHub)
eas update --branch main --message "Your update message"
```

### Building & Deployment
```bash
# Build for development
eas build --profile development

# Build for production
eas build --profile production

# Submit to app stores
eas submit
```

## 🌐 Multi-Computer Setup

### On New Computer
1. Install prerequisites (Node.js, Expo CLI, EAS CLI)
2. Login to Expo: `eas login`
3. Clone project: `npx create-expo-app --template blank CitizenTestAi`
4. Link to project: `eas init --id 24f53ef8-59f1-4d5c-99ad-145f9ebafda0`
5. Install dependencies: `npm install`
6. Start development: `npx expo start`

### Syncing Changes
- All changes are automatically synced through EAS Updates
- Use `eas update` to push changes to all devices
- GitHub integration ensures code backup

## 📁 Project Structure

```
├── App.js                 # Main app component
├── screens/               # 22 screen components
├── components/            # Reusable components
├── utils/                 # Utility functions (i18n, progress tracking)
├── data/                  # Question databases (9 languages)
├── locales/               # Translation files
├── styles/                # Theme configuration
├── assets/                # Images and icons
├── eas.json              # EAS Build configuration
└── app.json              # Expo configuration
```

## 🔧 Technologies Used

- **Frontend**: React Native, Expo SDK 53
- **Navigation**: React Navigation 7
- **AI**: Google Generative AI
- **Voice**: Expo Speech Recognition & TTS
- **Storage**: AsyncStorage
- **Build**: EAS Build
- **Updates**: EAS Updates

## 🌍 Supported Languages

- English (en)
- Spanish (es) 
- Korean (ko)
- Arabic (ar)
- French (fr)
- Hindi (hi)
- Chinese (zh)
- Vietnamese (vi)
- Filipino (tl)

## 🚀 Deployment

The app is configured with EAS Build for:
- **Development builds**: Internal testing
- **Preview builds**: APK for Android testing
- **Production builds**: App store deployment

## 🔐 Environment Variables

Create `.env` file for sensitive data:
```
GOOGLE_AI_API_KEY=your_api_key_here
```

## 🤝 Contributing

1. Make changes locally
2. Test with `npx expo start`
3. Push updates with `eas update`
4. Changes automatically sync across all devices

## 📞 Support

For issues or questions:
- Check Expo documentation
- Review EAS Build logs
- Contact project maintainer
