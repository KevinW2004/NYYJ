<template>
  <div class="course-timetable-container">
    <div class="main-timetable-container"
         :style="{ width: mainContainerWidth }"
    >
      <!-- Header: Month and Days of the Week -->
      <section class="header">
        <div class="month">{{ currentMonth }}</div>
        <div v-for="(day, index) in weekDays" :key="index" class="day">
          <div class="day-name">{{ day.name }}</div>
          <div class="day-date">{{ day.date }}</div>
        </div>
        <!-- 添加课程按钮 -->
        <transition name="button-fade">
        <button class="add-course-button" @click="isDialogVisible = true"
        v-if="!isSidebarVisible">+</button>
        </transition>
      </section>

      <!-- Main Course Table -->
      <section class="main-table">
        <!-- Time Slots on the left side -->
        <div class="time-column">
          <div v-for="(time, index) in timeSlots" :key="index" class="time-slot">
            <span class="time-range">{{ time.start }} - {{ time.end }}</span>
          </div>
        </div>
        <!-- Course Blocks for Each Day -->
        <div class="course-grid" v-for="(day, dayIndex) in weekDays" :key="dayIndex">
          <div
              v-for="(course, index) in getCoursesForDay(dayIndex + 1)"
              :key="index"
              :style="{ gridRow: `${course.section[0]} / span ${course.section.length}` }"
              :class="['course-block', `bg-${course.color}`]"
              @click="showCourseDetails(course)"
          >
            <p class="course-name">{{ courseInfoMap[course.key].name }}</p>
            <p class="course-room">{{ course.classroom }}</p>
          </div>
        </div>
      </section>

      <!-- Week Selector using VSlideGroup with VCard for each week -->
      <v-slide-group
          class="week-selector"
          show-arrows
          v-model="selectedWeek"
      >
        <v-slide-group-item
            v-for="week in totalWeeks"
            :key="week"
            :value="week"
        >
          <v-card
              outlined
              @click="selectWeek(week)"
              :class="{ 'selected-card': week === currentWeek }"
              class="week-card"
          >
            <v-card-text v-if="week <= 9">第 {{ week }} 周</v-card-text>
            <v-card-text v-else>第{{ week }}周</v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>

      <!-- 第一个弹窗: 添加课程 -->
      <v-dialog v-model="isDialogVisible" max-width="600px">
        <v-card class="edit-course__box shadow-lg rounded-lg">
          <v-card-title class="text-lg font-semibold" style="background: #9370DB">
            <h3 style="color: white">添加课程</h3>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="isFormValid" class="space-y-4">
              <span v-if="nameError" class="error-text" style="margin-bottom: 10px">{{ nameError }}</span>
              <v-text-field v-model="newCourse.name" label="课程名称"  required dense></v-text-field>

              <v-text-field v-model="newCourse.teacher" label="教师名字" outlined required></v-text-field>
              <v-textarea v-model="newCourse.description" label="课程备注" outlined></v-textarea>

              <!-- 组合列表，美化部分 -->
              <div v-for="(session, index) in newCourse.sessions" :key="index" class="session-card">
                <v-card class="rounded-lg mb-2 px-3 py-2 shadow-sm" @click="editSession(index)">
                  <v-row align="center" justify="space-between">
                    <v-col cols="10">
                      <p class="text-sm font-semibold">组合 {{ index + 1 }}</p>
                      <p class="text-xs mb-1">周数: {{ session.weeks }}</p>
                      <p class="text-xs mb-1">星期: {{ session.weekDay }}</p>
                      <!-- 条件检查，确保 timeSlots 存在并且是数组 -->
                      <p class="text-xs mb-1">时间:
                        {{ Array.isArray(session.timeSlots) ? session.timeSlots.join(', ') : '' }}</p>
                      <p class="text-xs">地点: {{ session.location }}</p>
                    </v-col>
                    <v-col cols="2" class="text-right">
                      <v-btn icon small @click.stop="removeSession(index)">
                        <v-icon color="red">mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </div>

              <!-- 新增课时按钮 -->
              <span v-if="sessionsError" class="error-text">{{ sessionsError }}</span>
              <br/>
              <v-btn @click="openNewSessionDialog" color="primary">新增课时</v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="addCourse" color="success">添加课程</v-btn>
            <v-btn @click="cancel" color="error">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 第二个弹窗: 配置组合A -->
      <v-dialog v-model="isSubDialogVisible" max-width="500px">
        <v-card class="configure-session__box shadow-lg rounded-lg">
          <v-card-title class="text-lg font-semibold" style="background: #9370DB">
            <h3 style="color: white">配置课时组合</h3>
          </v-card-title>
          <v-card-text>
            <v-form ref="subForm" class="space-y-4">
              <span v-if="startWeekError" class="error-text">{{ startWeekError }}</span>
              <div class="form-field">
                <v-select
                    v-model="tempSession.startWeek"
                    :items="weekOptions"
                    label="起始周"
                    outlined
                    required
                ></v-select>
              </div>

              <div class="form-field">
                <span v-if="endWeekError" class="error-text">{{ endWeekError }}</span>
                <v-select
                    v-model="tempSession.endWeek"
                    :items="weekOptions"
                    label="结束周"
                    outlined
                    required
                ></v-select>
              </div>

              <div class="form-field">
                <span v-if="weekTypeError" class="error-text">{{ weekTypeError }}</span>
                <v-radio-group
                    v-model="tempSession.weekType"
                    label="周数类型"
                    outlined
                    required
                    inline
                    class="label-styled"
                >
                  <v-radio label="全部" value="all"></v-radio>
                  <v-radio label="单周" value="single"></v-radio>
                  <v-radio label="双周" value="double"></v-radio>
                </v-radio-group>
              </div>

              <div class="form-field">
                <span v-if="dayError" class="error-text">{{ dayError }}</span>
                <v-select
                    v-model="tempSession.weekDay"
                    :items="weeks"
                    label="上课星期"
                    outlined
                    required
                ></v-select>
              </div>

              <div class="form-field">
                <span v-if="timeSlotsError" class="error-text">{{ timeSlotsError }}</span>
                <v-select
                    v-model="tempSession.timeSlots"
                    :items="formattedTimeSlots"
                    label="课程时间"
                    outlined
                    multiple
                    required
                ></v-select>
              </div>

              <div class="form-field">
                <span v-if="locationError" class="error-text">{{ locationError }}</span>
                <v-text-field
                    v-model="tempSession.location"
                    label="开课地点"
                    outlined
                    required
                ></v-text-field>
              </div>
            </v-form>

          </v-card-text>
          <v-card-actions>
            <!-- 确认按钮始终可点击 -->
            <v-btn @click="handleSubmit" color="success">确认</v-btn>
            <v-btn @click="isSubDialogVisible = false" color="error">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <!-- Course Details Sidebar -->
    <CourseDetailSidebar
        :courseInfo="selectedCourseInfo"
        :isVisible="isSidebarVisible"
        @close="closeSidebar"
        @update-course="updateSelectedCourseInfo"
        @remove-course="removeCourse"

    />

  </div>
</template>

<script>
// import {ref, computed, onMounted} from 'vue';
import {getCourses, readCurrentTermData, saveCourses,getTermLenthAndStartDate} from "@/utils/storage";
import CourseDetailSidebar from "@/components/CourseDetailSidebar.vue";

export default {
  components: {
    CourseDetailSidebar,
  },
  name: 'CourseTimetable',
  data() {
    return {
      // 用于动态调整宽度
      mainContainerWidth: '100%',  // 初始宽度为100%
      currentWeek: 0,
      selectedWeek: 0,
      totalWeeks: 17,
      weekDays: [],
      timeSlots: [
        {start: '08:00', end: '08:50', label: '第1节'},
        {start: '09:00', end: '09:50', label: '第2节'},
        {start: '10:10', end: '11:00', label: '第3节'},
        {start: '11:10', end: '12:00', label: '第4节'},
        {start: '14:00', end: '14:50', label: '第5节'},
        {start: '15:00', end: '15:50', label: '第6节'},
        {start: '16:10', end: '17:00', label: '第7节'},
        {start: '17:10', end: '18:00', label: '第8节'},
        {start: '18:30', end: '19:20', label: '第9节'},
        {start: '19:30', end: '20:20', label: '第10节'},
        {start: '20:30', end: '21:20', label: '第11节'},
        // {start: '21:30', end: '22:20', label: '第12节'}
      ],
      courseInfos: [],
      courseInfoMap: {}, // 用于快速查找课程信息
      currentMonth: '',
      semesterStartDate: new Date('2024-09-01'),
      isDialogVisible: false, // 控制弹窗的显示
      isSubDialogVisible: false, // 课时弹窗
      isFormValid: false, // 表单验证状态
      newCourse: {
        name: '',
        teacher: '',
        description: '',
        sessions: []                  // 已添加的课时组合
      },
      tempSession: {                  // 用于暂存新添加的组合A
        startWeek: null,
        endWeek: null,
        weekType: 'all',              // 默认选择全部周
        weekDay: null,
        timeSlots: [],
        location: ''
      },
      weekOptions: Array.from({length: 17}, (_, i) => i + 1),
      weeks: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      // 表单验证错误消息
      startWeekError: '',
      endWeekError: '',
      weekTypeError: '',
      dayError: '',
      timeSlotsError: '',
      locationError: '',
      storePath: 'D:/TEST/courses.json',
      // 详细信息
      selectedCourseInfo: null,
      isSidebarVisible: false,
      nameError: "",
      sessionsError: ""
    };
  },

  computed: {
    filteredCourses() {
      return this.splitCourses(this.courseInfos)
          .flatMap(courseInfo => courseInfo.courses.map(course => ({
            ...course,
            key: courseInfo.key
          })))
          .filter(course => course.weeks.includes(this.selectedWeek));
    },
    formattedTimeSlots() {
      return this.timeSlots
          .map(slot => `${slot.start} - ${slot.end}`)
    },
  },

  watch: {
    // 监听 tempSession.timeSlots 的变化，并按时间顺序排序
    'tempSession.timeSlots'(newTimeSlots) {
      if (Array.isArray(newTimeSlots)) {  // 先检查是否为数组
        this.tempSession.timeSlots = newTimeSlots.sort((a, b) => {
          const indexA = this.formattedTimeSlots.indexOf(a);
          const indexB = this.formattedTimeSlots.indexOf(b);
          return indexA - indexB;
        });
      }
    },
  },

  methods: {

    async setStartDateAndWeeks() {
      const termData = await getTermLenthAndStartDate()
      this.totalWeeks = parseInt(termData.totalWeeks)
      this.semesterStartDate = new Date(termData.startDate)
      //计算当前周数
      const today = new Date();
      const weeksDiff = Math.floor((today - this.semesterStartDate) / (7 * 24 * 60 * 60 * 1000));
      this.currentWeek = weeksDiff >= 0 ? weeksDiff + 1 : 0;
      this.selectedWeek = this.currentWeek;

      const startOfWeek = new Date(this.semesterStartDate);
      startOfWeek.setDate(startOfWeek.getDate() + (this.selectedWeek - 1) * 7);
      // 计算周的日期
      this.weekDays = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        this.weekDays.push({
          name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
          date: date.getDate(),
          month: date.getMonth() + 1
        });
      }

      this.currentMonth = startOfWeek.toLocaleString('default', {month: 'long'});
    },
    // 加载课程信息
    async loadTimetable() {
      try {
        // const response = await fetch('/course-timetable.json');
        // if (!response.ok) throw new Error('Failed to load timetable');
        // const data = await response.json();
        // this.courseInfos = data.courseInfos;
        // this.courseInfos = await readFile(this.storePath);
        // console.log(getCourses())
        this.courseInfos = await getCourses()
        // console.log(this.courseInfos)
        // 创建一个课程信息映射，以便快速查找课程名称和教师
        this.courseInfos.forEach(info => {
          this.courseInfoMap[info.key] = info;
        });
        const termData = await readCurrentTermData();
        this.weekOptions = Array.from({length: termData.totalWeeks}, (_, i) => i + 1)
      } catch (error) {
        console.log("错啦")
        console.error(error);
      }
    },

    // 新增课程
    async addCourse() {
      if (!this.newCourse.name) {
        this.nameError = "课程名称不能为空"
      } else {
        this.nameError = ""
      }

      if (this.newCourse.sessions.length === 0) {
        this.sessionsError = "请添加至少一个课时组合"
      } else {
        this.sessionsError = ""
      }

      // 如果有错误，不保存课程
      if (!this.newCourse.name || this.newCourse.sessions.length === 0) {
        return;
      }
      try {
        this.transformCourseData()
        // await saveDataToFile(this.storePath, this.courseInfos);
        await saveCourses(this.courseInfos)
        // this.courseInfos = await readFile(this.storePath);
        this.courseInfos = await getCourses()
        console.log("success")
      } catch (error) {
        console.error("fail:", error)
      }
      this.isDialogVisible = false
      this.resetCourse()
    },

    async removeCourse(course) {
      for (let i = 0; i < this.courseInfos.length; i++) {
        if (this.courseInfos[i].key === course.key) {
          this.courseInfos.splice(i, 1)
          break
        }
      }
      await saveCourses(this.courseInfos)
      this.courseInfos.forEach(info => {
        this.courseInfoMap[info.key] = info;
      });
      this.closeSidebar()
    },

    cancel() {
      this.isDialogVisible = false
      this.resetCourse()
    },

    resetCourse() {
      this.newCourse = {
        name: '',
        teacher: '',
        description: '',
        sessions: []                  // 已添加的课时组合
      }
    },

    showCourseDetails(course) {
      this.selectedCourseInfo = JSON.parse(JSON.stringify(this.courseInfoMap[course.key]));
      this.closeSidebar()
      setTimeout(() => {
        this.isSidebarVisible = true;
        // 调整 main-timetable-container 的宽度
        this.mainContainerWidth = '70%'; // 缩小为 70%，可以根据需要调整这个值
      }, 50);
    },

    closeSidebar() {
      this.isSidebarVisible = false;
      // 关闭侧边栏时恢复原宽度
      this.mainContainerWidth = '100%'; // 恢复为原始宽度
    },

    async updateSelectedCourseInfo(updatedCourseInfo) {
      console.log("保存课程修改")
      console.log(updatedCourseInfo)
      for (let i = 0; i < this.courseInfos.length; i++) {
        if (this.courseInfos[i].key === updatedCourseInfo.key) {
          this.courseInfos[i] = updatedCourseInfo
          await saveCourses(this.courseInfos)
          this.courseInfos.forEach(info => {
            this.courseInfoMap[info.key] = info;
          });
        }
      }
    },


    // 课程转换
    transformCourseData() {
      // 解析周次字符串为数组
      const parseWeeks = (weeksStr) => {
        const result = [];
        const ranges = weeksStr.match(/\d+-\d+|\d+/g) || [];
        for (const range of ranges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            for (let i = start; i <= end; i++) {
              result.push(i);
            }
          } else {
            result.push(Number(range));
          }
        }
        // 处理单双周
        if (weeksStr.includes('单周')) {
          return result.filter(week => week % 2 !== 0);
        } else if (weeksStr.includes('双周')) {
          return result.filter(week => week % 2 === 0);
        }
        return result;
      };

      // 将星期字符串解析为索引
      const parseWeekDay = (weekDay) => {
        for (let i = 0; i < this.weeks.length; i++) {
          if (this.weeks[i] === weekDay) {
            return i + 1;
          }
        }
        return -1; // 如果未匹配，返回 -1 表示错误
      };
      // 将时间段解析为节次
      const parseTimeSlots = (timeSlots) => {
        return timeSlots.map(slot => {
          const index = this.formattedTimeSlots.indexOf(slot);
          return index + 1; // 节次从 1 开始
        });
      };

      // 计算新课程的 key
      const maxKey = this.courseInfos.reduce((max, courseInfo) => {
        return Math.max(max, courseInfo.key);
      }, 0);
      const newKey = maxKey + 1;

      // 颜色数组
      const colorClasses = [
        'orange',
        'blue',
        'green',
        'red',
        'purple',
        'yellow',
        'pink',
        'teal',
        'gray',
      ];
      // 转换 `sessions` 中的每一节课
      const transformedCourses = this.newCourse.sessions.map(session => {
        return {
          classroom: session.location,
          color: colorClasses[Math.floor(Math.random() * colorClasses.length)],
          weeks: parseWeeks(session.weeks),
          day: parseWeekDay(session.weekDay),
          section: parseTimeSlots(session.timeSlots)
        };
      });

      // 构造新的课程数据
      const newCourseData = {
        key: newKey.toString(),
        name: this.newCourse.name,
        teacher: this.newCourse.teacher,
        remark: this.newCourse.description,
        courses: transformedCourses,
        session_for_show: this.newCourse.sessions
      };

      // 添加到 `courseInfos`
      this.courseInfos.push(newCourseData);
      console.log('New course added:', newCourseData);
      console.log(this.courseInfos)
      this.courseInfos.forEach(info => {
        this.courseInfoMap[info.key] = info;
      });
    },


    // 打开新增课程
    openNewSessionDialog() {
      this.resetTempSession();
      this.editingIndex = null;       // 新增模式
      this.isSubDialogVisible = true; // 打开弹窗
    },

    // 处理一门课的一个课时组
    editSession(index) {
      this.editingIndex = index;
      const session = this.newCourse.sessions[index];

      // 解析 weeks 字段，例如 "1-8 (单周)"
      const [weeksRange, weekTypeWithBrackets] = session.weeks.split(" ");
      const [startWeek, endWeek] = weeksRange.split("-").map(Number);
      const weekType = weekTypeWithBrackets.replace(/\(|\)/g, '');  // 去掉括号

      // 将解析的值加载到 tempSession
      this.tempSession = {
        startWeek,
        endWeek,
        weekType: weekType === "单周" ? "single" : weekType === "双周" ? "double" : "all",  // 根据中文转换为内部值
        weekDay: session.weekDay,
        timeSlots: [...session.timeSlots],  // 深拷贝数组
        location: session.location
      };

      this.isSubDialogVisible = true;
    },

    saveSession() {
      const type = this.tempSession.weekType === "all" ? "全部" :
          this.tempSession.weekType === "single" ? "单周" : "双周"
      const session = {
        weeks: `${this.tempSession.startWeek}-${this.tempSession.endWeek} (${this.tempSession.weekType === 'single' ? '单周' : this.tempSession.weekType === 'double' ? '双周' : '全部'})`,
        weekDay: this.tempSession.weekDay,
        timeSlots: this.tempSession.timeSlots,
        location: this.tempSession.location,
        startWeek: this.tempSession.startWeek,
        endWeek: this.tempSession.endWeek,
        weekType: type
      };

      if (this.editingIndex !== null) {
        // 编辑模式，更新现有组合
        this.newCourse.sessions.splice(this.editingIndex, 1, session);
      } else {
        // 新增模式，添加新组合
        this.newCourse.sessions.push(session);
      }
      this.resetTempSession();
    },

    removeSession(index) {
      this.newCourse.sessions.splice(index, 1);  // 移除指定索引的组合
    },

    resetTempSession() {
      this.tempSession = {
        startWeek: null,
        endWeek: null,
        weekType: 'all',
        weekDay: null,
        timeSlot: '',
        location: ''
      };
    },

    validateFields() {
      let isValid = true;

      // 验证起始周
      if (!this.tempSession.startWeek) {
        this.startWeekError = '请选择起始周';
        isValid = false;
      } else {
        this.startWeekError = '';
      }

      // 验证结束周
      if (!this.tempSession.endWeek) {
        this.endWeekError = '请选择结束周';
        isValid = false;
      } else if (this.tempSession.endWeek < this.tempSession.startWeek) {
        this.endWeekError = '结束周不能小于起始周';
        isValid = false;
      } else {
        this.endWeekError = '';
      }

      // 验证周数类型
      if (!this.tempSession.weekType) {
        this.weekTypeError = '请选择周数类型';
        isValid = false;
      } else {
        this.weekTypeError = '';
      }

      // 验证上课星期
      if (!this.tempSession.weekDay) {
        this.dayError = '请选择上课星期';
        isValid = false;
      } else {
        this.dayError = '';
      }

      // 验证课程时间
      if (!Array.isArray(this.tempSession.timeSlots) || this.tempSession.timeSlots.length === 0) {
        this.timeSlotsError = '请选择课程时间';
        isValid = false;
      } else {
        this.timeSlotsError = '';
      }

      // 验证开课地点
      if (!this.tempSession.location) {
        this.locationError = '请输入开课地点';
        isValid = false;
      } else {
        this.locationError = '';
      }

      return isValid;
    },

    handleSubmit() {
      if (this.validateFields()) {
        // 验证通过时保存数据并关闭弹窗
        this.saveSession();
        this.isSubDialogVisible = false;
      }
    },

    selectWeek(week) {
      this.selectedWeek = week;
      this.currentWeek = week;
      this.calculateWeekDays();
    },

    getCoursesForDay(dayIndex) {
      return this.filteredCourses.filter(course => course.day === dayIndex);
    },

    splitCourses() {
      return this.courseInfos.map((courseInfo) => {
        const newCourses = [];

        courseInfo.courses.forEach(course => {
          // 检查section是否连续
          const sections = course.section.sort((a, b) => a - b);
          const splitSections = [];
          let currentSection= [sections[0]];

          for(let i = 1; i < sections.length; i++) {
            if(sections[i] - sections[i-1] === 1) {
              currentSection.push(sections[i]);
            } else {
              splitSections.push([...currentSection]);
              currentSection = [sections[i]];
            }
          }
          splitSections.push(currentSection);

          // 如果需要拆分
          if(splitSections.length > 1) {
            splitSections.forEach(section => {
              newCourses.push({
                ...course,
                section
              });
            });
          } else {
            newCourses.push(course);
          }
        });

        return {
          ...courseInfo,
          courses: newCourses
        };
      });
    },

    calculateWeekDays() {
      const startOfWeek = new Date(this.semesterStartDate);
      startOfWeek.setDate(startOfWeek.getDate() + (this.selectedWeek - 1) * 7);

      this.weekDays = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        this.weekDays.push({
          name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
          date: date.getDate(),
          month: date.getMonth() + 1
        });
      }

      this.currentMonth = startOfWeek.toLocaleString('default', {month: 'long'});
    },

    calculateCurrentWeek() {
      const today = new Date();
      const weeksDiff = Math.floor((today - this.semesterStartDate) / (7 * 24 * 60 * 60 * 1000));
      this.currentWeek = weeksDiff >= 0 ? weeksDiff + 1 : 0;
      this.selectedWeek = this.currentWeek;
    }
  },

  mounted() {
    this.setStartDateAndWeeks();
    this.loadTimetable();
  }
};
</script>

<style scoped>
/* 渐变 Styles */
.button-fade-enter-active,
.button-fade-leave-active {
  transition: all 0.5s ease;
}
.button-fade-enter-from {
  transform: translateX(100%); /* 从右侧进入 */
  opacity: 0.1; /* 初始透明度 */
}
.button-fade-leave-to {
  transform: translateX(125%); /* 向右移动 */
  opacity: 0; /* 结束透明度 */
}
/* Container Styles */
.course-timetable-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 20px;
  border-radius: 20px;
  transition: width 0.3s ease;
}

.main-timetable-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 20px;
  background-color: rgba(250, 250, 250, 0.8);
  border-radius: 20px;
  transition: width 0.3s ease;
}

/* Header Section */
.header {
  display: grid;
  grid-template-columns: 15% repeat(7, 1fr);
  align-items: center;
  gap: 5px;
}

.month {
  font-weight: bold;
  font-size: 1.5em;
  text-align: center;
  grid-column: 1 / 2;
}

.day {
  text-align: center;
  font-weight: bold;
}

/* Add Course Button */
.add-course-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #42b983;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.time-column {
  display: grid; /* 确保使用网格布局 */
  grid-template-rows: repeat(12, 1fr); /* 高度与父网格行对齐 */
  grid-row: 1 / -1; /* 覆盖整个网格的行 */
  width: 100%; /* 自动适配 */
  height: 100%; /* 填满父容器分配的高度 */
}


.time-slot {
  display: flex; /* 只保留居中的样式 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  border-bottom: 1px solid #eaeaea; /* 可选分隔线 */
  height: 100%; /* 确保占据整个网格行的高度 */
}

.time-range {
  color: #555; /* 浅灰色用于时间范围 */
  font-size: 11px; /* 时间范围字体略小 */
}

/* Main Table Layout */
.main-table {
  display: grid;
  grid-template-columns: 15% repeat(7, 1fr);
  grid-template-rows: repeat(12, 1fr);
  gap: 5px;
  height: 100%;
  overflow: hidden;
}

/* Course Grid and Blocks */
.course-grid {
  display: grid; /* 确保使用网格布局 */
  grid-template-rows: repeat(12, 1fr); /* 高度与父网格行对齐 */
  grid-row: 1 / -1; /* 覆盖整个网格的行 */
  gap: 5px;
  height: 100%;
  max-width: 100%;
}

.course-block {
  display: grid;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  max-height: 100%;
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: auto;
}
.course-name {
  font-size: min(1.5em, 1.3vw);
}
.course-room {
  font-size: min(1em, 1.0vw);
}

/* Course Block Colors */
.bg-orange {
  background-color: #FFA500;
}

.bg-blue {
  background-color: #87CEEB;
}

.bg-green {
  background-color: #32CD32;
}

.bg-red {
  background-color: #FF6347;
}

.bg-purple {
  background-color: #9370DB;
}

.bg-yellow {
  background-color: #FFD700;
}

.bg-pink {
  background-color: #FF69B4;
}

.bg-teal {
  background-color: #20B2AA;
}

.bg-gray {
  background-color: #B0C4DE;
}


/* Week Selector */
.week-selector {
  margin-top: 10px;
  max-width: 100%;
}

.week-card {
  width: 80px;
  height: 100%;
  display: flex;
  text-align: center;
  margin-right: 10px;
}

.selected-card {
  background-color: #42b983 !important;
  color: white !important;
}

/* Week Selector Customizations */
.week-selector .v-slide-item span {
  padding: 0 10px;
  cursor: pointer;
}

.week-selector .selected {
  font-weight: bold;
}

/* 弹窗 */

.form-field {
  margin-bottom: 10px; /* 控制每个输入框与下一个输入框之间的间距 */
  display: flex;
  flex-direction: column;
  padding: 0;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: -4px; /* 使错误提示紧贴在输入框下方 */
  line-height: 1.2;
}
</style>

