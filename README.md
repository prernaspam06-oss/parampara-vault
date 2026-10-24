<p align="center"><img src="resources/icon-512.png" width="128" alt="Parampara Vault icon"></p>

# Parampara Vault

A bhakti companion for Android: chant your japa, break a sealed scroll of hidden history every evening, take scripture quizzes, collect devotee photocards and build your own dham.

**[⬇ Download the latest APK](https://github.com/prernaspam06-oss/parampara-vault/releases/latest)**

## Install on an Android phone

1. Open the link above on your phone and tap the `.apk` file under **Assets**.
2. When Android asks, allow **Install unknown apps** for your browser (or for WhatsApp, if someone sent you the file).
3. Open **Parampara Vault**, create your profile and allow notifications for the daily scroll reminder.

New versions install over the old one and keep your progress.

## Share it with friends

- Send them the download link above, or
- Send the `.apk` file itself over WhatsApp or Bluetooth (Nearby Share / Quick Share).

## Your progress

- Everything is saved on your phone. There are no accounts and nothing is uploaded.
- To move to a new phone: **Profile → Back up my progress**, save the file to Drive or send it to yourself, then on the new phone use **Restore from a backup**.
- Uninstalling the app deletes its data, so make a backup first.

## What's inside

| Tab | What it does |
| --- | --- |
| Today | Sealed scroll, japa counter (chant here or log rounds), power-ups, tulsi plant |
| Journey | Vraja parikrama map, temple builder, festival and Ekadashi calendar, scroll archive |
| Learn | Sunday boss quiz, scripture quiz room with daily fresh packs, photocard collections |
| Play | Timeline Dash, Lineage Links, Japa Sprint, Ember Snake, Twin Tiles, Flash Reflex |
| Dham | Build your holy place with coins, daily Sudarshana wheel |
| Stats | Bhakti Chart Data, Bhakti Wrapped, 58 rewards |

## Content

- `src/content/bank.js` holds the bundled content: 32 scrolls, 9 daily packs of 12 questions, and the festival calendar. It cycles from the day the app is installed.
- `content/remote.json` is fetched by the app when online. New days added there reach every installed app without a new release.

## Build it yourself

```bash
npm ci
npm run build          # bundles the web app into www/
npx cap sync android   # copies it into the Android project
cd android && ./gradlew assembleRelease
```

Every push to `main` builds a signed APK with GitHub Actions and publishes it as a release. Signing uses the repository secrets `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS` and `KEY_PASSWORD`.

## Credits

Scrolls and questions describe the scriptures and ISKCON history in our own words. Festival dates follow the ISKCON calendar for India and may differ locally by a day. Fonts: Yatra One, Kalam, Spectral and DM Mono (SIL Open Font License).
