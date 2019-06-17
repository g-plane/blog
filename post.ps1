$slug = $args[0]
$date = Get-Date -UFormat "%Y-%m-%d %T"
Set-Content -Path "./website/posts/$slug.md" -Value "---`ntitle: `ndate: $date`ntags:`n---`n`n"
