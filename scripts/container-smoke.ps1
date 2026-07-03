param(
    [ValidateSet("docker", "podman")]
    [string]$Runtime = "docker"
)

$ErrorActionPreference = "Stop"
$compose = @("compose", "-f", "compose.dev.yaml")

function Invoke-Compose {
    & $Runtime @compose @args
    if ($LASTEXITCODE -ne 0) {
        throw "$Runtime compose command failed with exit code $LASTEXITCODE"
    }
}

function Wait-ForUrl {
    param(
        [string]$Url,
        [int]$Attempts = 60
    )

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                return
            }
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }
    throw "Timed out waiting for $Url"
}

Invoke-Compose up --build --detach
Wait-ForUrl "http://127.0.0.1:8000/api/health/ready"
Wait-ForUrl "http://127.0.0.1:3000/tasks"

$before = & $Runtime @compose exec -T postgres psql -U travelops -d travelops -tAc `
    "SELECT COUNT(*) FROM tasks WHERE public_id = 'RF-1042';"
if ($LASTEXITCODE -ne 0 -or $before.Trim() -ne "1") {
    throw "Expected one persisted RF-1042 task before restart."
}

Invoke-Compose stop
Invoke-Compose up --detach
Wait-ForUrl "http://127.0.0.1:8000/api/health/ready"
Wait-ForUrl "http://127.0.0.1:3000/tasks"

$after = & $Runtime @compose exec -T postgres psql -U travelops -d travelops -tAc `
    "SELECT COUNT(*) FROM tasks WHERE public_id = 'RF-1042';"
if ($LASTEXITCODE -ne 0 -or $after.Trim() -ne "1") {
    throw "Expected RF-1042 to survive the stack restart."
}

Write-Output "Container smoke passed with $Runtime; RF-1042 survived restart."
