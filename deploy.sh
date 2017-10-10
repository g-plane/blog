cd ./public
git init
git config --local user.name "gplane"
git config --local user.email "g-plane@hotmail.com"
git add -A
git commit -m "Blog updated at `date +"%Y-%m-%d %H:%M:%S"`"
git push https://gplane:$coding_token@git.coding.net/gplane/gplane.coding.me.git master --force
