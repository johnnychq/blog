<div id="container"></div>
<link rel="stylesheet" href="https://imsun.github.io/gitment/style/default.css">
<script src="https://imsun.github.io/gitment/dist/gitment.browser.js"></script>
<script>
var gitment = new Gitment({
  // id: '页面 ID', // 可选。默认为 location.href
  owner: 'johnnychen',
  repo: 'blog',
  oauth: {
    client_id: '664c819fea18e0b92824',
    client_secret: '72395118edd7c93c165d5c03d206d1d225658e85',
  },
})
gitment.render('container')
</script>
