<style scoped>
.head{
    position: absolute;
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: left;
    background: linear-gradient(to right, rgb(202, 144, 223), purple);
}

.icon {
    position: relative;
    width: 10px;
    height: 30px;
}

.title {
    position: relative;
    left: 10px;
    font-size: 24px;
    font-weight: bold;
    color: violet;
}
</style>

<template>
    <div class="head">
        <v-img
          :src="require('../assets/logo.png')"
          cover
          class="icon"
          width="1"
        />
        <h3 class="title">南雍易记</h3>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'mainHeader',

    data () {
        return {
        }
    },
})
</script>
