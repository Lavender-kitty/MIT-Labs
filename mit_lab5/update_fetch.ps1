$songsPath = (Get-Item "./songs").FullName
$imagesPath = (Get-Item "./images").FullName
$jsonDataPath = (Get-Item "./data.json").FullName

if (-not (Test-Path $imagesPath)) {
    New-Item -ItemType Directory -Path $imagesPath | Out-Null
}

$shell = New-Object -ComObject Shell.Application
$artistList = @()

function Extract-Art {
    param($path, $artist)
    $safe = $artist -replace '[\\\/\:\*\?\"\<\>\|]', '_'
    $dest = Join-Path $imagesPath "$safe.jpg"
    if (Test-Path $dest) { return "images/$safe.jpg" }

    try {
        $stream = [System.IO.File]::OpenRead($path)
        $buffer = New-Object byte[] 1024000
        $read = $stream.Read($buffer, 0, $buffer.Length)
        $stream.Close()

        for ($i = 0; $i -lt ($read - 10); $i++) {
            if ($buffer[$i] -eq 0x41 -and $buffer[$i+1] -eq 0x50 -and $buffer[$i+2] -eq 0x49 -and $buffer[$i+3] -eq 0x43) {
                for ($j = $i + 10; $j -lt ($i + 200); $j++) {
                    if ($buffer[$j] -eq 0xFF -and $buffer[$j+1] -eq 0xD8 -and $buffer[$j+2] -eq 0xFF) {
                        $start = $j
                        $end = $read - 1
                        for ($k = $start; $k -lt ($read - 1); $k++) {
                            if ($buffer[$k] -eq 0xFF -and $buffer[$k+1] -eq 0xD9) {
                                $end = $k + 1
                                $size = $end - $start + 1
                                $img = New-Object byte[] $size
                                [Array]::Copy($buffer, $start, $img, 0, $size)
                                [System.IO.File]::WriteAllBytes($dest, $img)
                                return "images/$safe.jpg"
                            }
                        }
                    }
                }
            }
        }
    } catch {}
    return "images/placeholder.jpg"
}

$artistDirs = Get-ChildItem -Path $songsPath -Directory

foreach ($dir in $artistDirs) {
    $artistName = $dir.Name
    $songs = Get-ChildItem -Path $dir.FullName -Filter *.mp3
    if ($songs.Count -eq 0) { continue }

    $artistFolder = $shell.Namespace($dir.FullName)
    $songList = @()
    $artistImage = "images/placeholder.jpg"

    foreach ($file in $songs) {
        $item = $artistFolder.ParseName($file.Name)
        $title = $artistFolder.GetDetailsOf($item, 21)
        if (-not $title) { $title = $file.BaseName }

        if ($artistImage -eq "images/placeholder.jpg") {
            $artistImage = Extract-Art -path $file.FullName -artist $artistName
        }

        $songList += [PSCustomObject]@{
            title = $title
            path = "songs/$artistName/$($file.Name)"
        }
    }

    $artistList += [PSCustomObject]@{
        artist = $artistName
        image = $artistImage
        songs = $songList
    }
}

$rootSongs = Get-ChildItem -Path $songsPath -File -Filter *.mp3
if ($rootSongs.Count -gt 0) {
    $rootFolder = $shell.Namespace($songsPath)
    $unknownSongs = @()
    foreach ($file in $rootSongs) {
        $item = $rootFolder.ParseName($file.Name)
        $title = $rootFolder.GetDetailsOf($item, 21)
        if (-not $title) { $title = $file.BaseName }
        $unknownSongs += [PSCustomObject]@{
            title = $title
            path = "songs/$($file.Name)"
        }
    }
    $artistList += [PSCustomObject]@{
        artist = "Other"
        image = "images/placeholder.jpg"
        songs = $unknownSongs
    }
}

ConvertTo-Json @($artistList) -Depth 4 | Out-File -FilePath $jsonDataPath -Encoding utf8
Write-Host "Done! Updated data.json from folders. Purrr~" -ForegroundColor Green
