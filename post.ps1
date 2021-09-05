param (
    [Parameter(Position = 0, Mandatory)]
    [string]
    $Slug,

    [Parameter(Position = 1)]
    [string]
    $Title
)

$date = Get-Date -UFormat "%Y-%m-%d %T"
Set-Content -Path "./website/posts/$Slug.md" -Value "---`ntitle: $Title`ndate: $date`ntags:`n---`n`n"
