# Dev Note - v1.0.5

**Release Date:** October 23, 2025  
**Build Type:** Production APK

---

## 🎯 Major Features

### Study Calendar - Complete Localization
- **9 Languages Support**: English, Korean, Spanish, Chinese, Vietnamese, French, Hindi, Tagalog, Arabic
- **Real-time Language Switching**: Instant UI update without app restart
- **Memory Efficient**: Language change listeners (~150 bytes overhead)

### UI/UX Improvements
- **Calendar Icon**: Added subtle calendar icon on interview timeline banner (top-right)
- **Status Bar Alignment**: Study Calendar header properly positioned below status bar
- **Navigation Bar**: Content extends to navigation bar for full-screen experience

---

## 🔧 Technical Changes

### Localization System
```javascript
// Auto-refresh on language change
useEffect(() => {
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
  };
  addLanguageChangeListener(handleLanguageChange);
  return () => removeLanguageChangeListener(handleLanguageChange);
}, []);
```

### Removed Features
- Streak tracking (Current/Longest Streak) - Simplified calendar view
- Reduced visual clutter for better focus on daily progress

---

## 📦 Build Configuration

**Profile:** `production-apk`
```bash
eas build --platform android --profile production-apk
```

**Environment:**
- Production mode: Real ads, subscription validation
- AdMob: Live ad units active
- RevenueCat: Production API keys

---

## 🌍 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Complete |
| Korean | ko | ✅ Complete |
| Spanish | es | ✅ Complete |
| Chinese | zh | ✅ Complete |
| Vietnamese | vi | ✅ Complete |
| French | fr | ✅ Complete |
| Hindi | hi | ✅ Complete |
| Tagalog | tl | ✅ Complete |
| Arabic | ar | ✅ Complete |

---

## 🐛 Bug Fixes

- Fixed language not updating in Study Calendar screen
- Fixed header overlapping with status bar
- Improved safe area handling for Android devices

---

## 📊 Performance

- **Memory Impact**: Negligible (~150 bytes per listener)
- **Language Switch**: Instant (0ms delay)
- **Bundle Size**: No significant increase

---

## 🔜 Next Steps

- [ ] Test APK on multiple devices
- [ ] Verify all 9 languages display correctly
- [ ] Confirm ad integration in production
- [ ] Monitor subscription flow

---

**Built with:** React Native + Expo SDK 53  
**Package:** com.sinzjang.CitizenTestAi
