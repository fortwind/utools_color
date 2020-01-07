<script>
import { onMount } from 'svelte'

let header = []

let partName = window.jsonData.map(v => v.name)
let partUrl = window.jsonData.map(v => v.data.url)
let partData = window.jsonData.map(v => v.data.inner)
let chosen_colors = []
let chosen_index = 0
let header_width = [0, 0]
let slider_width = 0
let transform_dist = 0
let loadmask = false
let loadmask2right = false
let detailPage = false
let emoji_array = window.emoji_array
let emojiChange = ''
let copiedShow = false
let copiedMessage = ''
let copiedColor = ''

$: curPartData = partData[chosen_index]

const changeColors = (index) => () => {
	chosen_index = index
	slider_width = header_width[index]
	transform_dist = index - 1 < 0 ? 0 : header_width[index - 1]
}

const getDetail = (index) => () => {
	if (loadmask) return false
	chosen_colors = partData[chosen_index][index].colors
	loadmask = true
	setTimeout(() => {
		detailPage = true
	}, 300) // .mask transform
}

const goBack = () => {
	loadmask = false
	setTimeout(() => {
		detailPage = false
	}, 300) // .mask transform
}

const copy2clip = () => {
	const messages = ['COPIED!', 'GOT IT!', 'PASTE ME!', 'IT\'LL ROCK!', 'RIGHT ONE!', 'WILL DO!']
	new ClipboardJS('.bigcolor', {
		text: (trigger) => {
			const color = trigger.style.backgroundColor
			return color
		}
	}).on('success', ({text}) => {
		copiedMessage = messages[Math.floor(Math.random() * messages.length)]
		copiedColor = text
		copiedShow = true
		setTimeout(() => {
			copiedShow = false
			copiedMessage = ''
			copiedColor = ''
		}, 1000) // .colorshow animation
	})
}

onMount (() => {
	header_width = header.map(v => {
		const { width } = v.getBoundingClientRect()
		return width
	})
	slider_width = header_width[chosen_index]
})
</script>

<div id="app">
	<div class="place1" style="{detailPage ? 'display:none' : ''}">
		<div class="header">
			{#each partName as n, i}
				<span class="part" bind:this={header[i]} class:is-active="{chosen_index === i}" on:click={changeColors(i)}>{ n }</span>
			{/each}
			<div class="slider" style="width: {slider_width - 10}px; transform: translateX({transform_dist}px)"></div>
		</div>
		<div class="container">
			{#each partUrl as u, i}
				<div class="navurl" style="display: { i === chosen_index ? '' : 'none' }">
					<a href="{u}" style="color:#ffffff">{ u }</a>
				</div>
			{/each}
			<div class="content">
				<div class="inner">
					{#each curPartData as { colors, name, emoji }, i}
						<div class="inner-content" on:click="{getDetail(i)}">
							<div class="inner-container">
								<div class="colors smallcolors {colors.length > 7 ? 'morecolor' : 'lesscolor'}">
									{#each colors as color, i}
										<div class="color smallcolor" style="background-color: {color}; flex-grow: {(2 * i + 1) ** (1 / 2)}"></div>
									{/each}
								</div>
								<div class="name">
									{ name }
									<!-- <span class="emoji">{ emoji }</span> -->
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<div class="mask" class:mask-move="{loadmask}"></div>
	<div class="place2" style="{detailPage ? '' : 'display:none'}">
		<div class="dheader">
			<span class="back" on:click="{goBack}">&larr; Back</span>
			<!-- <div class="conver-color">
				{#each ['RGB', 'HEX', 'HSLA'] as mode}
					<label>
						<input type="radio" bind:value="{mode}" />
						<span>{mode}</span>
					</label>
				{/each}
			</div> -->
		</div>
		<div class="colors bigcolors {chosen_colors.length > 7 ? 'morecolor' : 'lesscolor'}">
			{#each chosen_colors as color, i}
				<div class="color bigcolor" style="background-color: {color}; flex-grow: {(2 * i + 1) ** (1 / 2)}" on:click="{copy2clip}">
					<span class="color-copy"> COPY </span>
					<span class="corner">{ color }</span>
				</div>
			{/each}
		</div>
		<div class="success-mask" style="{ copiedShow ? '' : 'display:none' }">
			<div class="cont" style="background-color: {copiedColor}">
				<div class="colorShow">
					<div class="message"><i>{ copiedMessage }</i></div>
					<span class="cc">{ copiedColor }</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>

#app{
  width: 100%;
  height: 100%;
}

.place1{
  width: 720px;
  height: 100%;
  margin: auto;
}

.header{
  display: flex;
  position: relative;
  font-size: 18px;
  margin-top: 20px;
  margin-bottom: 20px;
  font-weight: 700;
  user-select: none;
}

.header::after{
  position: absolute;
  content: '';
  width: 100%;
  height: 1px;
  background-color: #ffffff8f;
  bottom: -5px;
}

.part{
  position: relative;
  padding-right: 10px;
  color: #ffffff8f;
  transition: color 0.2s;
  cursor: pointer;
}

.part.is-active{
  color: #ffffff;
}

.part:hover{
  color: #ffffff;
}

.slider{
  position: absolute;
  height: 2px;
  width: 100px;
  background-color: rgb(86, 249, 239);
  border-radius: 10px;
  bottom: -5px;
  transition: width 0.2s, transform 0.2s;
}

.container{
  width: 100%;
  height: 100%;
}

.navurl{
  width: 100%;
  text-align: end;
}

.inner{
  display: grid;
  grid-template-columns: repeat(3, calc(720px * 0.3));
  justify-content: space-between;
  row-gap: 18px;
  margin: 24px 0;
}

.inner-content{
  padding: 8px 8px 0;
  height: 120px;
  color: #000000;
  background-color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
}

.inner-container{
  width: 100%;
  height: 100%;
}

.smallcolors{
  width: 100%;
  height: calc(100% - 28px);
  border-radius: 4px;
  overflow: hidden;
}

.colors{
  display: flex;
  justify-content: center;
  align-items: center;
}

.colors.morecolor{
  flex-wrap: wrap;
}

.colors.morecolor .color{
  position: relative;
  width: 20%;
  height: 25%;
  flex: 0 0 auto;
}

.colors.lesscolor{
  flex-direction: column-reverse;
}

.colors.lesscolor .color{
  position: relative;
  width: 100%;
  flex-grow: 1;
}

.name{
  font-size: 11px;
  font-weight: 700;
  line-height: 28px;
  padding-left: 5px;
}

.name .emoji{
  float: right;
  margin-right: 5px;
}


.mask{
  position: fixed;
  width: 120%;
  height: 100%;
  background-color: #ffffff;
  top: 0;
  transform: translateX(100%);
  transition: transform 0.6s cubic-bezier(0,.18,.99,.78);
  z-index: 11;
}

.mask.mask-move{
  transform: translateX(-100%);
}

.place2{
  width: 100%;
  height: 100%;
  color: #000000;
  background-color: #ffffff;
  user-select: none;
}

.dheader{
  height: 50px;
  line-height: 50px;
}

.back{
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.bigcolors{
  width: 100%;
  height: calc(100% - 50px);
  cursor: pointer;
}

.color .color-copy{
  position: relative;
  display: block;
  width: 90px;
  text-align: center;
  height: 42px;
  line-height: 42px;
  top: 50%;
  transform: translateY(-50%);
  margin: auto;
  color: #ffffff;
  border: 2px solid #ffffff4d;
  border-radius: 5px;
  opacity: 0;
  font-weight: 800;
  transition: opacity 0.3s, transform 0.2s ease-in-out;
}

.color:hover .color-copy{
  opacity: 1;
}

.color:active .color-copy{
  transform: translateY(-50%) scale(0.96);
}

.color .corner{
  position: absolute;
  padding: 4px;
  bottom: 0;
  right: 0;
  font-size: 13px;
  color: #ffffff;
  font-weight: 800;
}

/* .copied-enter .colorShow{
  transform: scale(1.2);
}
.copied-enter-to .colorShow{
  transform: scale(1);
}
.copied-leave-to .colorShow{
  transform: scale(0.8);
}
.copied-enter-active .colorShow, .copied-leave-active .colorShow{
  transition: transform 0.3s;
} */

.success-mask{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  text-align: center;
  z-index: 3;
  background-color: #3C40C6;
}

.cont{
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 160%;
  height: 100%;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.colorShow{
  width: 100%;
  animation: animateColor 1s ease;
}

@keyframes animateColor {
  0% {
    transform: scale(1.24);
    opacity: 0;
  }
  30% {
    transform: scale(1);
    opacity: 1;
  }
  70% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.64);
    opacity: 0;
  }
}

.colorShow .message{
  width: 100%;
  height: 20vh;
  color: #fff;
  font-size: 14vh;
  text-shadow: 1px 2px 3px #424141;
  background-color: rgba(255, 255, 255, 0.12);
}

.colorShow .cc{
  color: #fff;
  display: inline-block;
  font-size: 18px;
  font-weight: bold;
  margin-top: 30px;
}
</style>