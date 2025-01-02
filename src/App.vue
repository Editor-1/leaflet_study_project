<template>
  <div id="app">
    <el-container>
		<el-header>
			<NavMenu></NavMenu>
		</el-header>
		<el-main>Main</el-main>
	</el-container>
  </div>
</template>

<script>
export default {
  name: 'app',//name属性作为组件名称，全局 ID 自动作为组件的 name
  data () {
  	return {
  	}
  },
  components:{
	NavMenu: ()=> import("./components/NavMenu.vue")
  },
  methods:{
  },
  watch:{
  }
}
</script>

<style>
</style>
