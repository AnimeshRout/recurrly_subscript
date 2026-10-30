$keystore = Join-Path $env:USERPROFILE ".android\debug.keystore"

if (-not (Test-Path $keystore)) {
  Write-Host "No debug keystore found at $keystore"
  Write-Host "Create one by running an Android emulator/build, or use: eas credentials -p android"
  exit 1
}

Write-Host "SHA fingerprints from $keystore"
keytool -list -v -keystore $keystore -alias androiddebugkey -storepass android -keypass android
