<template>
  <v-container>
    <v-card>
      <v-card-title>
        <span class="headline">设置</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="username" label="用户名" required :rules="[rules.required]"></v-text-field>

          <v-text-field v-model="motto" label="座右铭" required :rules="[rules.required]"></v-text-field>

<!--          <v-file-input v-model="avatar" label="头像" accept="image/*" prepend-icon="mdi-camera"></v-file-input>-->

          <v-select v-model="currentTerm" :items="terms" label="选择当前学期" required
                    :rules="[rules.required]"></v-select>
          <v-divider></v-divider>
          <v-btn @click="openEditTermDialog" color="primary">编辑当前学期</v-btn>
          <v-btn @click="openNewTermDialog" color="success"
            style="margin-left: 10px;"
          >创建新学期</v-btn>
          <v-btn @click="deleteCurrentTerm" color="error"
            style="margin-left: 10px;"
          >删除当前学期</v-btn>
          <v-divider></v-divider>
          <v-btn @click="saveSettings" color="primary">保存</v-btn>

        </v-form>
      </v-card-text>
    </v-card>
    <v-dialog v-model="newTermDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">创建新学期</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="newTermName" label="学期名称" required
                        :rules="[rules.required]"></v-text-field>
          <h4> 开课日期（仅限周一） </h4>
          <v-date-picker v-model="startDate" label="开课时间" required :allowed-dates="allowedDates" color="purple"></v-date-picker>
          <v-text-field v-model="totalWeeks" label="总周数" type="number" required
                        :rules="[rules.required]"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeNewTermDialog" color="grey">取消</v-btn>
          <v-btn @click="saveNewTerm" color="primary">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 编辑当前学期的弹窗 -->
    <v-dialog v-model="editTermDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">编辑当前学期</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="newTermName" label="学期名称" required :rules="[rules.required]"></v-text-field>
          <h4> 开课日期（仅限周一） </h4>
          <v-date-picker v-model="startDate" label="开课时间" required :allowed-dates="allowedDates" color="purple"></v-date-picker>
          <v-text-field v-model="totalWeeks" label="总周数" type="number" required :rules="[rules.required]"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="editTermDialog = false" color="grey">取消</v-btn>
          <v-btn @click="saveEditTerm" color="primary">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {ref, onMounted} from 'vue';
import {
  readGlobalConfig,
  writeGlobalConfig,
  readCurrentTermData,
  createNewTerm, readTermData, saveTermData, deleteTerm
} from '@/utils/storage';

export default {
  setup() {
    const username = ref('');
    const motto = ref('');
    const avatar = ref(null);
    const currentTerm = ref('');
    const terms = ref([]);
    const editTermDialog = ref(false);
    const newTermDialog = ref(false);
    let newTermName = ref('');
    const startDate = ref(null);
    const totalWeeks = ref(0);
    const valid = ref(false);

    const rules = {
      required: (v) => !!v || '此项为必填项',
    };
    // 允许的日期函数：检查日期是否为周一
    const allowedDates = (date) => {
      const day = new Date(date).getUTCDay(); // 获取日期的星期几
      return day === 0; // 0 代表星期一
    };

    const loadSettings = async () => {
      const config = await readGlobalConfig();
      username.value = config.username;
      motto.value = config.motto;
      currentTerm.value = config.currentTerm;
      terms.value = config.terms || [];
    };

    const saveSettings = async () => {
      const config = await readGlobalConfig();
      config.username = username.value;
      config.motto = motto.value;
      config.currentTerm = currentTerm.value;
      await writeGlobalConfig(config);
      window.location.reload();
      alert('设置已保存！');
    };

    const openEditTermDialog = async () => {
      const TermData = await readTermData(currentTerm.value)
      if (TermData) {
        newTermName.value = TermData.name;
        startDate.value = new Date(TermData.startDate);
        console.log(startDate.value);
        totalWeeks.value = TermData.totalWeeks;
      }
      editTermDialog.value = true;
    };

    const saveEditTerm = async () => {
      console.log("saveEditTerm");
      const TermData = await readTermData(currentTerm.value)
      TermData.name = newTermName.value;
      TermData.startDate = startDate.value.toISOString().split('T')[0];
      TermData.totalWeeks = totalWeeks.value;
      if (newTermName.value !== currentTerm.value) {
        await deleteTerm(currentTerm.value)
        terms.value.splice(terms.value.indexOf(currentTerm.value), 1);
        currentTerm.value = newTermName.value;
        terms.value.push(newTermName.value);
        const globalConfig = await readGlobalConfig();
        globalConfig.terms.push(newTermName.value);
        await writeGlobalConfig(globalConfig);
        await createNewTerm(TermData)
      } else{
        await saveTermData(currentTerm.value, TermData)
      }
      editTermDialog.value = false;
      alert('学期信息已更新！');
    };

    const openNewTermDialog = () => {
      newTermDialog.value = true;
    };

    const closeNewTermDialog = () => {
      newTermDialog.value = false;
      newTermName.value = '';
      startDate.value = null;
      totalWeeks.value = 0;
    };
    const deleteCurrentTerm = async () => {
      const confirmation = confirm(`确定要删除当前学期 "${currentTerm.value}" 吗？`);
      if (confirmation) {
        await deleteTerm(currentTerm.value); // 假设这是一个删除学期的函数
        alert('学期已删除！');
        window.location.reload();
      }
    };

    const saveNewTerm = async () => {
      const newTerm = {
        name: newTermName.value,
        startDate: startDate.value.toISOString().split('T')[0],
        totalWeeks: totalWeeks.value,
        courses: [],
      };
      await createNewTerm(newTerm);
      terms.value.push(newTerm.name);  // 更新学期选择器
      window.location.reload();
      alert('新学期已创建！');
    };

    onMounted(loadSettings);

    return {
      username,
      motto,
      avatar,
      currentTerm,
      terms,
      editTermDialog,
      newTermDialog,
      newTermName,
      startDate,
      totalWeeks,
      valid,
      rules,
      saveSettings,
      openEditTermDialog,
      openNewTermDialog,
      closeNewTermDialog,
      saveNewTerm,
      saveEditTerm,
      deleteCurrentTerm,
      allowedDates,
    };
  },
};
</script>

<style scoped>
.v-container {
  background: radial-gradient(circle at 80% 70%, #d1a8e2, #ee9acf, #e5d0dd 70%, rgba(173, 216, 230, 0.5));
  padding-top: 30px;
  padding-left: 100px;
  padding-right: 100px;
  min-width: 100%;
  height: 100%;
}

.v-card {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.headline {
  font-weight: bold;
  color: #6200ea; /* 紫色 */
  border-bottom: 2px solid #6200ea; /* 紫色 */
}

.v-btn {
  background-color: #6200ea; /* 主色调 */
  color: white;
}

.v-btn:hover {
  background-color: #3700b3; /* 深紫色 */
}

.v-divider {
  margin: 20px 0;
}

.v-select,
.v-text-field {
  margin-top: 20px;
}

.v-dialog {

}

.v-card-title {
  background-color: #e1bee7; /* 浅紫色 */
  color: #6200ea; /* 紫色 */
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
</style>
