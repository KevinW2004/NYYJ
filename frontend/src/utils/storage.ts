import {checkFileExist, readFile, saveDataToFile} from "./file";

const BASE_PATH = 'D:/NYYJ-Storage/'
const GLOBAL_CONFIG_FILE = `${BASE_PATH}global_config.json`

interface GlobalConfig {
    username: string;
    motto: string;
    currentTerm: string;
    terms: string[];
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
    username: "游客",
    motto: "每天进步多一点",
    currentTerm: "新学期1",
    terms: ["新学期1"]
};

// 读取全局配置
export const readGlobalConfig = async () => {
    if (!await checkFileExist(GLOBAL_CONFIG_FILE)) {
        await saveDataToFile(GLOBAL_CONFIG_FILE, DEFAULT_GLOBAL_CONFIG);
        await createNewTerm({name: "新学期1", totalWeeks: 17, startDate: new Date().toISOString().split('T')[0]});
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
const readTermData = async (term: string) => {
    const termFilePath = `${BASE_PATH}${term}.json`;
    try {
        const response = await fetch(termFilePath);
        if (!response.ok) {
            throw new Error(`Failed to read term data for ${term}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error reading term data for ${term}:`, error);
        throw error;
    }
};

// 保存特定学期的数据
const saveTermData = async (term: string, data: any) => {
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
        startDate: termData.startDate || new Date().toISOString().split('T')[0], // 获取当天日期
        courses:  termData.courses || []
    };
    await saveTermData(term, newTermData); // 创建新学期数据文件
    return newTermData;
}

