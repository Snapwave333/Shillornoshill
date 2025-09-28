# Shill or No Shill - Game Master Settings Documentation

## 🎮 Game Logic Pseudocode

### Core Game Initialization with Game Master Settings

```
FUNCTION InitializeGame(gameSettings)
    // Step 1: Read max prize configuration
    maxPrize ← gameSettings.maxPrizeAmount          // Largest possible case value (USD)
    totalCases ← gameSettings.numberOfCases
    zeroCases ← gameSettings.zeroAmountCases
    highValueCases ← gameSettings.maxDollarBoxes

    // Step 2: Generate prize distribution from $0 → maxPrize using an exponential curve
    // curveExponent controls how quickly values ramp up (1.0 = linear, >1 = more low/mid values)
    curveExponent ← 2.0
    distributedValues ← []
    FOR i FROM 0 TO (totalCases - 1)
        t ← i / (totalCases - 1)                    // Normalized position [0,1]
        value ← ROUND( (t ^ curveExponent) × maxPrize, -2 )  // Round to nearest $100
        distributedValues.append(value)

    // Step 3: Ensure zero-amount traps are exactly $0
    FOR i FROM 1 TO zeroCases
        distributedValues[i-1] ← 0
    standardCases ← totalCases - highValueCases - zeroCases

    // Step 4: Create value distribution
    gameValues ← []

    // Step 4: Compose final game values
    // - Take top N values near maxPrize for high-value cases
    // - Keep the lowest values (including zeros) as traps/mid-tier
    sortedAsc ← SORT_ASC(distributedValues)
    trapsAndMid ← TAKE_FIRST(sortedAsc, standardCases)
    topTier ← TAKE_LAST(sortedAsc, highValueCases)
    gameValues ← CONCAT(trapsAndMid, topTier)

    // Step 5: Shuffle and assign to cases
    shuffledValues ← shuffle(gameValues)
    cases ← []
    FOR caseNum FROM 1 TO totalCases
        cases.append({
            number: caseNum,
            value: shuffledValues[caseNum-1],
            opened: false
        })

    RETURN cases
```

### Banker's Offer Calculation with Aggressiveness

```
FUNCTION CalculateBankerOffer(remainingValues, gameSettings, currentRound)
    // Step 1: Calculate statistical average
    IF LENGTH(remainingValues) = 0
        RETURN 0

    sum ← 0
    FOR EACH value IN remainingValues
        sum ← sum + value

    statisticalAverage ← sum / LENGTH(remainingValues)

    // Step 2: Apply aggressiveness modifier
    aggressiveness ← gameSettings.bankerOfferAggressiveness
    // Aggressiveness scale: 1=Fair (100%), 3=Balanced (85%), 5=Aggressive (70%)
    offerMultiplier ← 1.0 - ((aggressiveness - 1) × 0.075)

    // Step 3: Apply round-based adjustments
    roundMultiplier ← 1.0
    IF currentRound = 1
        roundMultiplier ← 0.9   // Conservative early offers
    ELSE IF currentRound ≥ 6
        roundMultiplier ← 1.1   // More aggressive in late game

    // Step 4: Calculate final offer
    rawOffer ← statisticalAverage × offerMultiplier × roundMultiplier

    // Step 5: Round to nearest 100 and format
    finalOffer ← round(rawOffer / 100) × 100

    RETURN finalOffer
```

### Game Flow with Custom Opening Sequence

```
FUNCTION ProcessGameRound(currentRound, casesOpened, gameSettings)
    // Step 1: Get opening sequence for current round
    sequence ← gameSettings.caseOpeningSequence
    IF currentRound > LENGTH(sequence)
        casesToOpen ← 1  // Default to single case opening
    ELSE
        casesToOpen ← sequence[currentRound-1]

    // Step 2: Check if round is complete
    IF casesOpened ≥ casesToOpen
        // Step 3: Calculate remaining values
        remainingValues ← []
        FOR EACH case IN cases
            IF NOT case.opened AND case.number ≠ playerCase
                remainingValues.append(case.value)

        // Step 4: Generate offer using aggressiveness settings
        offer ← CalculateBankerOffer(remainingValues, gameSettings, currentRound)

        // Step 5: Select random crypto for offer presentation
        cryptoOptions ← gameSettings.tokenOfferList
        selectedCrypto ← cryptoOptions[random(0, LENGTH(cryptoOptions)-1)]

        RETURN {
            offer: offer,
            crypto: selectedCrypto,
            roundComplete: true,
            nextRoundCases: casesToOpen
        }

    RETURN {
        offer: null,
        crypto: null,
        roundComplete: false,
        casesNeeded: casesToOpen - casesOpened
    }
```

## 📊 API/Data Structure Mock-up

### Game Master Settings Input Structure

```json
{
  "gameConfiguration": {
    "maxPrizeAmount": 100000,
    "numberOfCases": 26,
    "maxDollarBoxes": 5,
    "zeroAmountCases": 1,
    "caseOpeningSequence": [6, 5, 4, 3, 2, 1],
    "bankerOfferAggressiveness": 3,
    "tokenOfferList": ["BTC", "ETH", "SOL"]
  },
  "cryptoPrices": {
    "BTC": 45000.00,
    "ETH": 3000.00,
    "SOL": 100.00,
    "ADA": 0.50,
    "DOGE": 0.08,
    "MATIC": 1.20
  },
  "streamerPreferences": {
    "sessionId": "stream_2024_01_15_001",
    "difficultyLevel": "balanced",
    "maxGameDuration": 1800,
    "enableChatIntegration": true
  }
}
```

### Game State Output Structure

```json
{
  "gameState": {
    "sessionId": "stream_2024_01_15_001",
    "currentRound": 1,
    "gamePhase": "case_opening",
    "playerCase": 13,
    "casesOpened": 0,
    "totalCases": 26,
    "remainingCases": 25
  },
  "remainingValues": [0, 0, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 800, 1200, 2500, 5000, 10000, 15000, 20000, 30000, 40000, 50000, 65000, 80000, 90000, 100000],
  
  // Example distribution with Max Prize: $100,000 and one $0 trap
  // Values scale smoothly from $0 → $100,000
  // (Actual values depend on curve exponent and rounding)
  // "remainingValues": [0, 0, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 800, 1200, 2500, 5000, 10000, 15000, 20000, 30000, 40000, 50000, 65000, 80000, 90000, 100000],
  "currentOffer": {
    "amount": 25000,
    "currency": "USD",
    "cryptoEquivalent": {
      "BTC": 0.555,
      "ETH": 8.333,
      "SOL": 250.0
    },
    "round": 1,
    "timestamp": "2024-01-15T20:30:00Z"
  },
  "history": [
    {
      "round": 1,
      "offer": 25000,
      "decision": "reject",
      "openedValues": [0.01, 1, 5, 10, 25, 50]
    }
  ],
  "visualState": {
    "highlightedCases": [1, 3, 5, 7],
    "eliminatedValues": [0.01, 1, 5],
    "animationQueue": ["case_open", "value_reveal", "offer_presentation"]
  }
}
```

### Real-time Crypto Price Integration

```json
{
  "priceUpdate": {
    "timestamp": "2024-01-15T20:30:15Z",
    "source": "coinmarketcap_api",
    "prices": {
      "BTC": {
        "USD": 45000.00,
        "change_24h": 2.5,
        "volatility_index": 0.15
      },
      "ETH": {
        "USD": 3000.00,
        "change_24h": -1.2,
        "volatility_index": 0.22
      }
    }
  },
  "offerRecalculation": {
    "trigger": "price_threshold_exceeded",
    "originalOffer": 25000,
    "adjustedOffer": 24750,
    "reason": "ETH_price_decreased_by_1.2_percent"
  }
}
```

## 🎨 Visual Asset Concept

### Futuristic/Crypto-Vault Theme Design

#### Color Palette
- **Primary Background**: Deep space gradient (#0a0a0a → #1a1a2e → #16213e)
- **Accent Colors**: Cyan (#00ffff), Magenta (#ff00ff), Gold (#ffff00)
- **Crypto Colors**: Bitcoin Orange (#f7931a), Ethereum Blue (#627eea), Solana Purple (#9945ff)
- **UI Elements**: Translucent blacks with cyan borders, glowing effects

#### Visual Elements
1. **Animated Background**
   - Subtle floating geometric shapes
   - Cryptocurrency symbols drifting across screen
   - Matrix-style digital rain effect with crypto prices

2. **Case Design**
   - Metallic briefcases with holographic surfaces
   - LED edge lighting that pulses with crypto market data
   - Case numbers displayed in glitch-text font
   - Opening animation with digital unlock effects

3. **Game Master Panel**
   - Dark glassmorphism panels with blur effects
   - Real-time crypto price tickers in corners
   - Holographic control interfaces
   - Neon glowing borders and accents

4. **Value Display**
   - Dollar amounts with crypto equivalencies
   - Real-time conversion rates
   - Animated number reveals with digital effects
   - Color-coded by value tiers (bronze/silver/gold/platinum)

#### Game Master Settings Panel Mock-up

```
┌─────────────────────────────────────────────────────────────┐
│  🎮 GAME MASTER CONTROL CENTER                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚙️ PRIZE CONFIGURATION                             │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Max Prize: $100,000                          │   │   │
│  │  │ [ $100 ]────────[ $10k ]────────[ $100k ]    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Cases: [─] 26 [+]  High-Value: [─] 5 [+]    │   │   │
│  │  │ Zero Traps: [─] 1 [+]                       │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │
│  │  🎯 GAME FLOW CONFIGURATION                          │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Opening Sequence: 6, 5, 4, 3, 2, 1, 1       │   │   │
│  │  │ Banker Aggro: ████████░░░░░░░░ 3/5          │   │   │
│  │  │ [Fair]──────[Balanced]─────[Aggressive]      │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │
│  │  💎 CRYPTOCURRENCY OPTIONS                           │
│  │  ☑ BTC ☑ ETH ☑ SOL ☐ ADA ☐ DOGE ☐ MATIC          │
│  │                                                     │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📊 CONFIGURATION PREVIEW                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎯 PRIZE CONFIG: Max Prize = $100,000                │   │
│  │ Sample Values: $0 → $100 → $1,200 → ... → $100,000  │   │
│  │ Total Cases: 26 | High Value: 5 | Traps: 1          │   │
│  │                                                     │   │
│  │ 🎮 GAME FLOW: 6→5→4→3→2→1→1 cases per round        │   │
│  │ Banker: Balanced (3/5)                              │   │
│  │                                                     │   │
│  │ 💎 CRYPTO: BTC, ETH, SOL                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [💾 Save] [🚀 Launch Game] [📤 Export]                     │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Customization Parameters Summary

### Prize Configuration Variables

| Parameter | Description | Range | Default | Impact |
|-----------|-------------|-------|---------|---------|
| **Max Prize Amount ($)** | Sets the largest case value; all other values scale 0 → max | $100-$1,000,000 | $100 | Defines prize pool ceiling and distribution |
| **Number of Cases** | Total briefcases in game | 10-50 | 26 | Changes game duration and complexity |
| **High-Value Cases** | Count of top-tier cases near max prize | 1-10 | 5 | Controls jackpot frequency |
| **Zero-Amount Cases** | $0 trap cases | 0-5 | 1 | Adds tension and risk |

### Game Flow Variables

| Parameter | Description | Input Type | Default | Impact |
|-----------|-------------|------------|---------|---------|
| **Case Opening Sequence** | Cases to open per round | Comma-separated numbers | 6,5,4,3,2,1 | Controls game pacing |
| **Banker Offer Aggressiveness** | How aggressive banker offers are | Slider 1-5 | 3 | Affects offer calculations |
| **Cryptocurrency Options** | Available tokens for offers | Multi-select checkboxes | BTC, ETH, SOL | Adds crypto integration |

### Technical Implementation Variables

| Parameter | Description | Values | Default | Purpose |
|-----------|-------------|--------|---------|---------|
| **Session ID** | Unique game session identifier | Auto-generated | stream_YYYY_MM_DD_XXX | Tracking and analytics |
| **Difficulty Level** | Overall game balance preset | Easy, Balanced, Hard | Balanced | Quick configuration |
| **Max Game Duration** | Maximum session length | 900-3600 seconds | 1800 | Stream timing control |
| **Chat Integration** | Enable/disable chat features | Boolean | True | Audience participation |

### Advanced Configuration Options

```javascript
// Example advanced settings object
const advancedSettings = {
    // Prize distribution algorithm
    prizeDistribution: {
        algorithm: "exponential", // exponential, linear, custom
        volatilityFactor: 0.15,   // Randomness in value assignment
        preserveValueTiers: true  // Maintain relative value relationships
    },

    // Real-time adjustments
    dynamicScaling: {
        enablePriceAdjustment: true,    // Adjust offers based on crypto prices
        adjustmentThreshold: 0.05,      // 5% price change triggers recalculation
        maxAdjustmentPercent: 0.10      // Maximum 10% offer adjustment
    },

    // Auto-save and persistence
    autoSave: {
        interval: 60,              // Seconds between auto-saves
        maxBackupCount: 10,        // Number of backup files to keep
        enableCloudSync: false,    // Sync settings to cloud storage
        backupOnExit: true         // Create backup when closing
    },

    // Custom case content
    customCaseContent: {
        enableImageOverlay: true,  // Show custom images when cases open
        enableSoundEffects: true,  // Play custom sounds when cases open
        maxFileSize: 5242880,      // 5MB max file size for uploads
        supportedFormats: [        // Allowed file types
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "audio/mpeg", "audio/wav", "audio/ogg"
        ],
        animationDuration: 3000    // How long to show custom content (ms)
    },

    // Visual customization
    themeCustomization: {
        colorScheme: "crypto_vault",    // crypto_vault, classic, neon
        animationSpeed: "normal",       // slow, normal, fast
        soundEffects: true,             // Enable/disable audio cues
        particleEffects: true           // Background animations
    }
};
```

## 🔄 Auto-Save System

### Auto-Save Algorithm

```
FUNCTION SetupAutoSave(interval)
    IF autoSaveTimer EXISTS
        CLEAR autoSaveTimer

    IF interval > 0
        autoSaveTimer ← SET_INTERVAL(interval × 1000)
            EXECUTE AutoSaveProcedure()

FUNCTION AutoSaveProcedure()
    // Step 1: Validate current game state
    IF gameState IS VALID
        // Step 2: Create backup of current settings
        backupData ← {
            timestamp: CURRENT_TIME,
            gameSettings: gameSettings,
            gameState: gameState,
            version: "1.0"
        }

        // Step 3: Save to localStorage
        localStorage.SET('shillOrNoShillSettings', JSON.stringify(backupData))

        // Step 4: Optional cloud sync
        IF enableCloudSync
            SYNC_TO_CLOUD(backupData)

        // Step 5: Maintain backup rotation
        MAINTAIN_BACKUP_LIMIT(maxBackupCount)

        // Step 6: Log success
        LOG("Auto-saved at " + CURRENT_TIME)
```

### Backup Management

- **Automatic Rotation**: Keeps only the latest N backups to prevent storage bloat
- **Corruption Detection**: Validates JSON integrity before saving
- **Recovery Options**: Can restore from any previous auto-save point
- **Export Functionality**: Export settings for sharing between sessions

## 🎭 Custom Case Content System

### File Upload and Processing

```
FUNCTION ProcessCaseContent(caseNumber, imageFile, soundFile)
    // Step 1: Validate file types and sizes
    IF NOT VALIDATE_FILE(imageFile, supportedFormats, maxFileSize)
        RETURN ERROR("Invalid image file")

    IF NOT VALIDATE_FILE(soundFile, supportedFormats, maxFileSize)
        RETURN ERROR("Invalid sound file")

    // Step 2: Convert to base64 for storage
    imageData ← FILE_TO_BASE64(imageFile)
    soundData ← FILE_TO_BASE64(soundFile)

    // Step 3: Store in game settings
    gameSettings.customCaseContent[caseNumber] ← {
        image: imageData,
        sound: soundData,
        uploadTime: CURRENT_TIME,
        fileSize: CALCULATE_SIZE(imageFile, soundFile)
    }

    // Step 4: Update UI
    UPDATE_CONFIGURED_CASES_LIST()

    RETURN SUCCESS
```

### Content Trigger System

```
FUNCTION TriggerCaseContent(caseNumber)
    caseConfig ← gameSettings.customCaseContent[caseNumber]

    IF caseConfig EXISTS
        // Step 1: Show custom image overlay
        IF caseConfig.image AND enableImageOverlay
            SHOW_IMAGE_OVERLAY(caseConfig.image, animationDuration)

        // Step 2: Play custom sound effect
        IF caseConfig.sound AND enableSoundEffects
            PLAY_SOUND_EFFECT(caseConfig.sound)

        // Step 3: Log content trigger
        LOG("Triggered custom content for case " + caseNumber)

        RETURN TRUE

    RETURN FALSE
```

### Supported File Formats

| Content Type | Formats | Max Size | Use Case |
|--------------|---------|----------|----------|
| **Images** | JPEG, PNG, GIF, WebP | 5MB | Case reveal overlays, special effects |
| **Audio** | MP3, WAV, OGG | 5MB | Sound effects, voice lines, music clips |

## 📊 Updated API Structure with New Features

### Enhanced Settings Input Structure

```json
{
  "gameConfiguration": {
    "maxPrizeAmount": 100000,
    "numberOfCases": 26,
    "maxDollarBoxes": 5,
    "zeroAmountCases": 1,
    "caseOpeningSequence": [6, 5, 4, 3, 2, 1],
    "bankerOfferAggressiveness": 3,
    "tokenOfferList": ["BTC", "ETH", "SOL"],
    "autoSaveInterval": 60,
    "customCaseContent": {
      "1": {
        "image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
        "sound": "data:audio/mpeg;base64,/+MYxAAAAANIAAAAA...",
        "uploadTime": "2024-01-15T20:30:00Z"
      },
      "13": {
        "image": "data:image/gif;base64,R0lGODlhEAAQAPIAAP8A...",
        "sound": "data:audio/wav;base64,UklGRnoGAABXQVZFZm10...",
        "uploadTime": "2024-01-15T20:35:00Z"
      }
    }
  },
  "backupSettings": {
    "maxBackupCount": 10,
    "enableCloudSync": false,
    "backupOnExit": true,
    "compressionEnabled": true
  }
}
```

### Auto-Save Data Structure

```json
{
  "autoSave": {
    "sessionId": "stream_2024_01_15_001",
    "timestamp": "2024-01-15T20:30:00Z",
    "interval": 60,
    "backupCount": 5,
    "totalSize": 2048576,
    "lastBackup": "2024-01-15T20:29:00Z"
  },
  "recoveryOptions": [
    {
      "timestamp": "2024-01-15T20:29:00Z",
      "description": "After case 5 opened",
      "gameState": "mid_round",
      "fileSize": 409600
    },
    {
      "timestamp": "2024-01-15T20:25:00Z",
      "description": "After case 3 opened",
      "gameState": "mid_round",
      "fileSize": 307200
    }
  ]
}
```

This comprehensive Game Master Settings system provides streamers with complete control over their Shill or No Shill gaming experience while maintaining the core excitement and tension of the Deal or No Deal format. The addition of auto-save functionality and custom case content creates endless possibilities for personalized, memorable gaming sessions.
