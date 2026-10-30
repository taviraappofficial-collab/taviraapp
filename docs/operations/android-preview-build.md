# Android preview build

The internal preview profile produces a directly installable APK connected to
the production TAVIRA API. It is for controlled stakeholder testing, not Play
Store distribution.

## One-time setup

1. Sign in to the Expo account that owns the TAVIRA project:
   `pnpm dlx eas-cli@latest login`.
2. From `apps/mobile`, link or create the EAS project when prompted by the first
   build. Keep the Android application ID `com.tavira.app`.

## Create the APK

From `apps/mobile`, run:

```powershell
pnpm dlx eas-cli@latest build --platform android --profile preview
```

EAS prints a private build page and an APK download link when the build is
complete. Install that APK only on test devices whose users understand that the
preview connects to the live API.

## Pre-build checks

From the repository root, run:

```powershell
pnpm.cmd --filter @tavira/mobile lint
pnpm.cmd --filter @tavira/mobile typecheck
pnpm.cmd --filter @tavira/mobile test
pnpm.cmd --filter @tavira/mobile build
```

The preview profile sets `EXPO_PUBLIC_API_URL` to
`https://tavira-api.onrender.com`. No database password or Supabase secret key
belongs in the mobile build.
