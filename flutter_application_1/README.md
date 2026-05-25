# Coursaty Mobile

Flutter mobile app for the Coursaty tutoring marketplace.

## Included

- Mobile-first home, class browsing, tutor browsing, class details, tutor profiles, booking, dashboard, and account screens.
- Supabase email/password authentication with secure token persistence.
- Production API integration through the Next.js mobile API routes.
- English and Arabic localization with LTR/RTL direction switching.
- Light and dark themes aligned with the Coursaty brand.
- Compact marketplace cards, loading states, empty states, error states, and pull-to-refresh.

## Configuration

The app uses the public Supabase URL and publishable key in `lib/core/constants.dart`. Do not place service-role keys or private server credentials in the Flutter app.

Set the web API base URL at build/run time:

```powershell
flutter run --dart-define=COURSATY_API_BASE_URL=https://your-vercel-domain.com
```

For Android emulator local development against a Next.js server on the host machine:

```powershell
flutter run --dart-define=COURSATY_API_BASE_URL=http://10.0.2.2:3000
```

For a physical phone on the same network, use your computer LAN IP instead of `localhost`.

## Development

```powershell
flutter pub get
flutter analyze
flutter test
flutter build apk --debug
```

The mobile API expects bearer tokens from Supabase auth and validates them server-side before returning user, booking, and role-specific data.
