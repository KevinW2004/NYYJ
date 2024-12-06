<style scoped>
.head{
    height: 100%;
    width: 100%;
    background: linear-gradient(to right, rgb(202, 144, 223), purple);
    display: flex;
    align-items: center;
}

.icon {
    margin-top: 5px;
    margin-left: 15px;
    width: 35px;
    height: 35px;
}

.title {
    font-size: 27px;
    font-weight: bold;
    color: rgb(178, 92, 244);
    margin-left: 25px;
}

.title-img {
    margin-left: 25px;
    margin-top: 3px;
}
</style>

<template>
    <div class="head">
        <div class="icon">
            <v-img
            :src="require('../assets/icon.png')"
            width="200"
            />
        </div>
<!--        <h3 class="title">南雍易记</h3>-->
        <div class="title-img">
          <v-img
          :src="require('../assets/南雍易记-字.png')"
          width="150"
          />
        </div>
    </div>
</template>


<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
    name: 'mainHeader',

    data () {
        return {
        }
    },
})
</script>
