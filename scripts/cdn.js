function regexpify (path) {
    return new RegExp(path + '(?!#)', 'gi')
}

function cdnify (path) {
    return hexo.config.cdn.assets.path + path + '#'
}

hexo.extend.filter.register('before_generate', function () {
    hexo.extend.filter.register('after_render:html', function (content) {
        if (!hexo.config.cdn.assets.enable) {
            return content
        }

        var resources = [
            hexo.theme.config.favicon,
            hexo.theme.config.avatar,
            hexo.theme.config.site_header_image,
            hexo.theme.config.post_header_image,
            hexo.theme.config._404_image,
            '/css/style.css',
            '/scripts/main.js',
            '/css/prism-atom-dark.css',
            '/assets/loading.svg',
        ]

        return resources.reduce(function (carry, item) {
            return carry.replace(regexpify(item), cdnify(item))
        }, content)
    })
});
