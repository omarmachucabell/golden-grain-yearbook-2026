# Run from this file after extracting the patch into the repository root.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if ((Get-FileHash -LiteralPath 'album-catalog.json' -Algorithm SHA256).Hash.ToLower() -ne 'ade12868d6771c3cd0ca730cc7704aabd77623d0b3573ff3df41aae6b91bf9b6') { throw 'Extract Patch 001 into the repository root and replace its files before cleanup.' }
if ((Get-FileHash -LiteralPath 'album-capture-dates.json' -Algorithm SHA256).Hash.ToLower() -ne '8088cbc90dbdbb8f30a63878a15685c994a80e8f32b81bda835bee51cf3c1b92') { throw 'Extract Patch 001 into the repository root and replace its files before cleanup.' }
if ((Get-FileHash -LiteralPath 'album-updates.json' -Algorithm SHA256).Hash.ToLower() -ne '6b758d13daaaa50d6a35d4b15ec08244adb4d431c3dc3c196ad804ff9d5952b6') { throw 'Extract Patch 001 into the repository root and replace its files before cleanup.' }
$target = 'assets/golden-moments/7fc5f6d0f6384b3a94d5b8f304805e6b2d49193b4e0944c692b2bb7b34b109b2.webp'
if (Test-Path -LiteralPath $target) {
  if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLower() -ne '83d36623f10bf2a4a55f5b380faf47a2f5cc8472eeea47a81edf73fda99fff64') { throw 'Photo file differs from the baseline; cleanup stopped.' }
  Remove-Item -LiteralPath $target
}
Write-Host 'Patch 001 photo cleanup complete. Review, commit and push in GitHub Desktop.'
