<template>
  <div class="skeleton">
    <header title="试试疯狂地点我？">
      <div class="shadow" @click="play">
        <div class="side-dummy" />
        <span class="title">关于 Pig Fang</span>
        <div class="side-dummy" />
      </div>
    </header>
    <main>
      <div class="side-dummy" />
      <markdown ref="content">
        <p>第一次认真写「关于我」这样的页面：）所以这是 Edition One</p>

        <h2>关于我</h2>

        <p>嗯，我常用的 ID 是 <code>gplane</code> 或 <code>GPlane</code>，
        有时候你可能看到带「<code>-</code>」的版本，也就是 <code>g-plane</code>，例如我的 GitHub。
          <code>Pig Fang</code> 这个很显然不是我的真名（然而姓是真的，具体是哪个汉字你们自己猜吧），
          但已经被我在不少地方如 GitHub 和 Twitter 上使用。</p>

        <!-- eslint-disable max-len -->
        <ul>
          <li>目前是大二狗</li>
          <li>数学渣，英语一般般</li>
          <li>中重度强迫症，懒癌晚期</li>
          <li>网易云音乐用户。不过播放本地音乐会用 foobar2000（Windows 下）和 Clementine（Linux 和 macOS 下）</li>
          <li>歌单里日语歌数量最多，这里面以 ACG 为主；粤语歌里最喜欢的是陈慧娴的；不怎样听国语（虽然也有）；纯音乐里最喜欢的是 Yanni 的 <em>Nightingale</em></li>
          <li>中考完的暑假（2013 年）开始接触 Minecraft，并且十分热爱这个游戏</li>
          <li>一直想入手正版 Minecraft，可惜没钱，直到 2017 年暑假才有机会入了正</li>
          <li>做事很随意，但对于文字和语言的使用方面十分追求严谨</li>
          <li>打字用五笔（比拼音快一丢丢）。曾经学了3次但都放弃了，2015年元旦开始第4次然后持续到现在</li>
          <li>最早接触的编程语言是 Visual Basic，大概是在2010年的时候</li>
          <li>初三和高中学过一点的 AutoIt v3</li>
          <li>大学开始学 JavaScript，特别是2017年花了不少时间去学 JavaScript（还有 TypeScript）</li>
          <li>会一点点 PHP 和 Python，但已经放弃 Python</li>
          <li>2017年下半年开始学 Rust</li>
          <li>喜欢看偏向于日常类型的动漫或喜剧性的动漫，不喜欢战斗番</li>
          <li>喜欢的声优是神谷浩史、花泽香菜、大西沙织、德井青空、种田梨沙（按我所认识的时间先后排序）</li>
        </ul>


        <h2>怎样能找到我？</h2>
        <ul>
          <li><p>邮箱：<a href="mailto:g-plane@hotmail.com">g-plane@hotmail.com</a></p></li>
          <li><p>QQ（如果你知道）</p></li>
          <li><p>GitHub: <a href="https://github.com/g-plane">@g-plane</a></p></li>
        </ul>
        <p>另外我还有别的账号，你可以关注我下面这些账号，但不建议通过这些方式来联系我：</p>
        <ul>
          <li>Twitter: <a href="https://twitter.com/g3plane">@g3plane</a></li>
          <li>网易云音乐：<a href="http://music.163.com/#/user/home?id=62126971">@gplane</a></li>
        </ul>
        <!-- eslint-enable max-len -->

        <p><nuxt-link to="/">Back to home</nuxt-link></p>
      </markdown>
      <div class="side-dummy" />
    </main>
    <vue-disqus class="disqus" shortname="gplane-blog" />
    <footer-bar />
  </div>
</template>

<script>
import Markdown from '@/components/markdown'
import FooterBar from '@/components/footer'

export default {
  head() {
    return {
      title: '关于 Pig Fang'
    }
  },
  components: {
    Markdown,
    FooterBar
  },
  data() {
    return {
      clicked: 0
    }
  },
  methods: {
    play() {
      if (this.clicked >= 20) {
        Array.from(this.$refs.content.$el.querySelectorAll('*'))
          .forEach(el => setTimeout(
            () => (el.className += ' animated hinge'),
            2000 * Math.random()
          ))
      } else {
        this.clicked++
      }
    }
  }
}
</script>

<!-- eslint-disable max-len -->
<style lang="stylus" scoped>
@import "animate.css/source/_base.css"
@import "animate.css/source/specials/hinge.css"

header
  height 50vh
  overflow hidden
  box-shadow -0.2rem 0 0.7rem 0 rgba(0,0,0,0.8)
  font-family 'Roboto Slab', 'Microsoft Yahei', 'Ubunto Mono'
  background-position center center
  background-repeat no-repeat
  background-size cover
  background-image url("https://hexo-blog-1251929322.file.myqcloud.com/intro/intro-desktop.jpg")
  .shadow
    position absolute
    left 0
    top 0
    width 100%
    height 50vh
    background-color rgba(0, 0, 0, 0.4)
    color #fff
    display flex
    justify-content center
  .title
    margin-top 20vh
    font-size 42px

main
  padding-top 15px
  padding-bottom 60px
  display flex
  justify-content center

.side-dummy
  @media (max-width: 768px)
    width 15px
  @media (min-width: 768px)
    width 38%

.disqus
  @media (max-width: 768px)
    width 90%
  @media (min-width: 768px)
    width 54%

.disqus
  position relative
  margin-bottom 30px
  @media (max-width: 768px)
    left 15px
  @media (min-width: 768px)
    left 23%
</style>
