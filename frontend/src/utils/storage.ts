import {checkFileExist, deleteFile, readFile, saveDataToFile} from "./file";
import store from "@/store";

const BASE_PATH = 'D:/NYYJ-Storage/'
const GLOBAL_CONFIG_FILE = `${BASE_PATH}global_config.json`

interface GlobalConfig {
    username: string;
    motto: string;
    currentTerm: string;
    terms: string[];
}
interface TermData {
    name: string;
    totalWeeks: number;
    startDate: string;
    courses: any[];
    todoList: any[];
}
interface TodoData {
    id: number;
    course: string; // 关联课程
    title: string;
    description: string;
    status: string; // “已完成”“未完成”“已逾期”
    dueDate: string;
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
    username: "游客",
    motto: "每天进步多一点",
    currentTerm: "新学期1",
    terms: []
};

// 读取全局配置
export const readGlobalConfig = async () => {
    console.log("readGlobalConfig")
    if (!await checkFileExist(GLOBAL_CONFIG_FILE)) {
        await saveDataToFile(GLOBAL_CONFIG_FILE, DEFAULT_GLOBAL_CONFIG);
        await createNewTerm({ name: "新学期1", totalWeeks: 17, startDate: new Date().toISOString() });
    }
    const config = await readFile(GLOBAL_CONFIG_FILE);
    // return JSON.parse(config) as GlobalConfig;
    return config as GlobalConfig;
};

// 写入全局配置
export const writeGlobalConfig = async (config: GlobalConfig) => {
    console.log("writeGlobalConfig")
    try {
        await saveDataToFile(GLOBAL_CONFIG_FILE, config);
    } catch (error) {
        console.error('Error writing global config:', error);
        throw error;
    }
};

// 获取当前激活学期
export const getCurrentTerm = async () => {
    console.log("getCurrentTerm")
    const config = await readGlobalConfig();
    return config.currentTerm;
};

// 设置当前激活学期
export const setCurrentTerm = async (term: string) => {
    console.log("setCurrentTerm")
    const config = await readGlobalConfig();
    config.currentTerm = term; // 更新当前学期
    await writeGlobalConfig(config); // 写回配置文件
};

// 读取特定学期的数据
export const readTermData = async (term: string) => {
    console.log("readTermData")
    const termFilePath = `${BASE_PATH}${term}.json`;
    console.log('reading term path:', termFilePath);
    try {
        const response = await readFile(termFilePath)
        return response as TermData;
    } catch (error) {
        console.error(`Error reading term data for ${term}:`, error);
        throw error;
    }
};

// 保存特定学期的数据
export const saveTermData = async (term: string, data: any) => {
    console.log("saveTermData")
    const termFilePath = `${BASE_PATH}${term}.json`;
    try {
        await saveDataToFile(termFilePath, data);
    } catch (error) {
        console.error(`Error saving term data for ${term}:`, error);
        throw error;
    }
};

// 读取当前学期的数据
export const readCurrentTermData = async () => {
    console.log("readCurrentTermData")
    const currentTerm = await getCurrentTerm();
    console.log('reading currentTerm:', currentTerm);
    return await readTermData(currentTerm);
};

// 保存当前学期的数据
export const saveCurrentTermData = async (data: any) => {
    console.log("saveCurrentTermData")
    const currentTerm = await getCurrentTerm();
    await saveTermData(currentTerm, data);
};

export const createNewTerm = async (termData: any) => {
    console.log("createNewTerm")
    const config = await readGlobalConfig();
    const term = termData.name || `新学期${config.terms.length + 1}`;
    config.terms.push(term); // 增加新学期
    config.currentTerm = term; // 设置为当前学期
    await writeGlobalConfig(config); // 写回配置文件
    const newTermData = {
        name: term,
        totalWeeks: termData.totalWeeks || 17,
        startDate: termData.startDate || new Date().toLocaleString(),
        courses: termData.courses || [],
        todoList: termData.todoList || []
    };
    await saveTermData(term, newTermData); // 创建新学期数据文件
    return newTermData;
}

// 删除学期
export const deleteTerm = async (term: string) => {
    console.log("deleteTerm")
    const config = await readGlobalConfig();
    const index = config.terms.indexOf(term);
    if (index !== -1) {
        config.terms.splice(index, 1); // 删除学期
        if (config.currentTerm === term) {
            config.currentTerm = config.terms[0] || '新学期1'; // 设置为第一个学期
        }
        await writeGlobalConfig(config); // 写回配置文件
        const termFilePath = `${BASE_PATH}${term}.json`;
        await checkFileExist(termFilePath) && await deleteFile(termFilePath);
    }
};

// 获取当前学期的 courses 数据
export const getCourses = async () => {
    console.log("getCourses")
    const termData = await readCurrentTermData();
    return termData.courses;
};

// 保存当前学期的 courses 数据
export const saveCourses = async (courses: any) => {
    console.log("saveCourses")
    const termData = await readCurrentTermData();
    termData.courses = courses;
    await saveCurrentTermData(termData);
};

// 读取当前学期的 todos 数据
export const getTodos = async () => {
    console.log("getTodos")
    const termData = await readCurrentTermData();
    return termData.todoList || [];
};

export const setTodos = async (todos: any) => {
    const termData = await readCurrentTermData();
    termData.todoList = todos;
    await saveCurrentTermData(termData);
};

// 增加一个 todos 数据
export const addTodo = async (todo: Omit<TodoData, 'id' | 'status'>) => {
    console.log("addTodo")
    const termData = await readCurrentTermData();

    // 自动生成 ID，假设 ID 是递增的
    const newId = termData.todoList.length > 0
        ? Math.max(...termData.todoList.map(t => t.id)) + 1
        : 1;

    // 新的 todo 数据
    const newTodo: TodoData = {
        id: newId,
        ...todo,
        status: '未完成', // 默认状态
    };

    termData.todoList.push(newTodo); // 添加 todo
    await saveCurrentTermData(termData); // 保存数据
};

// 更新一个 todos 数据
export const updateTodo = async ( updatedTodo: TodoData) => {
    console.log("updateTodo")
    const termData = await readCurrentTermData();
    for(let i = 0; i < termData.todoList.length; i++){
        if(termData.todoList[i].id === updatedTodo.id){
            termData.todoList[i] = updatedTodo;
            await saveCurrentTermData(termData);
        }
    }
};
// 删除一个 todos 数据
export const deleteTodo = async (index: number) => {
    console.log("deleteTodo")
    const termData = await readCurrentTermData();
    if (index >= 0 && index < termData.todoList.length) {
        termData.todoList.splice(index, 1); // 删除指定的 todo
        await saveCurrentTermData(termData); // 保存数据
    } else {
        throw new Error('Invalid todo index');
    }
};

// 添加完成任务的方法
export const finishTodo = async (id: number) => {
    console.log("finishTodo")
    const termData = await readCurrentTermData();
    const todo = termData.todoList.find(todo => todo.id === id);
    if (todo) {
        todo.status = "已完成";
        await saveCurrentTermData(termData);
    } else {
        throw new Error("Todo not found");
    }
};

// 添加重置任务的方法
export const resetTodo = async (id: number) => {
    console.log("resetTodo")
    const termData = await readCurrentTermData();
    const todo = termData.todoList.find(todo => todo.id === id);
    if (todo) {
        todo.status = "未完成";
        if (todo.dueDate) {
            const currentDate = new Date().toISOString(); // 获取当前时间
            const dueDate = new Date(todo.dueDate).toISOString(); // 任务截止日期
            if (currentDate > dueDate) {
                todo.status = "已逾期"; // 状态改为逾期
            }
        }
        await saveCurrentTermData(termData);
    } else {
        throw new Error("Todo not found");
    }
};

// 将任务标记为逾期
export const markTodoAsOverdue = async () => {
    console.log("markTodoAsOverdue")
    const termData = await readCurrentTermData();
    const currentDate = new Date().toISOString(); // 获取当前时间

    termData.todoList.forEach(todo => {
        // 如果任务未完成且过期了，标记为逾期
        if (todo.status !== "已完成" && todo.dueDate < currentDate) {
            todo.status = "已逾期"; // 状态改为逾期
        }
        // 如果任务已完成，且过期了，则删除该任务
        if (todo.status === "已完成" && todo.dueDate < currentDate) {
            termData.todoList.splice(termData.todoList.indexOf(todo), 1); // 删除该任务
        }
    });

    await saveCurrentTermData(termData); // 保存更新后的数据
};
