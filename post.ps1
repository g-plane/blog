$slug = $args[0]
$title = $args[1]
$date = Get-Date -UFormat "%Y-%m-%d %T"
Set-Content -Path "./website/posts/$slug.md" -Value "---`ntitle: $title`ndate: $date`ntags:`n---`n`n"
