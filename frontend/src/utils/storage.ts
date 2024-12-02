import {checkFileExist, deleteFile, readFile, saveDataToFile} from "./file";

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
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
    username: "游客",
    motto: "每天进步多一点",
    currentTerm: "新学期1",
    terms: []
};

// 读取全局配置
export const readGlobalConfig = async () => {
    if (!await checkFileExist(GLOBAL_CONFIG_FILE)) {
        await saveDataToFile(GLOBAL_CONFIG_FILE, DEFAULT_GLOBAL_CONFIG);
        await createNewTerm({name: "新学期1", totalWeeks: 17, startDate: new Date().toISOString()});
    }
    const config = await readFile(GLOBAL_CONFIG_FILE);
    // return JSON.parse(config) as GlobalConfig;
    return config as GlobalConfig;
};

// 写入全局配置
export const writeGlobalConfig = async (config: GlobalConfig) => {
    try {
        await saveDataToFile(GLOBAL_CONFIG_FILE, config);
    } catch (error) {
        console.error('Error writing global config:', error);
        throw error;
    }
};

// 获取当前激活学期
export const getCurrentTerm = async () => {
    const config = await readGlobalConfig();
    return config.currentTerm;
};

// 设置当前激活学期
export const setCurrentTerm = async (term: string) => {
    const config = await readGlobalConfig();
    config.currentTerm = term; // 更新当前学期
    await writeGlobalConfig(config); // 写回配置文件
};

// 读取特定学期的数据
export const readTermData = async (term: string) => {
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
    const currentTerm = await getCurrentTerm();
    console.log('reading currentTerm:', currentTerm);
    return await readTermData(currentTerm);
};

// 保存当前学期的数据
export const saveCurrentTermData = async (data: any) => {
    const currentTerm = await getCurrentTerm();
    await saveTermData(currentTerm, data);
};

export const createNewTerm = async (termData: any) => {
    const config = await readGlobalConfig();
    const term = termData.name || `新学期${config.terms.length + 1}`;
    config.terms.push(term); // 增加新学期
    config.currentTerm = term; // 设置为当前学期
    await writeGlobalConfig(config); // 写回配置文件
    const newTermData = {
        name: term,
        totalWeeks: termData.totalWeeks || 17,
        // startDate: termData.startDate || new Date().toISOString().split('T')[0],
        startDate: termData.startDate || new Date().toISOString(),
        courses:  termData.courses || []
    };
    await saveTermData(term, newTermData); // 创建新学期数据文件
    return newTermData;
}

// 删除学期
export const deleteTerm = async (term: string) => {
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
    const termData = await readCurrentTermData();
    return termData.courses;
};

// 保存当前学期的 courses 数据
export const saveCourses = async (courses: any) => {
    const termData = await readCurrentTermData();
    termData.courses = courses;
    await saveCurrentTermData(termData);
};
