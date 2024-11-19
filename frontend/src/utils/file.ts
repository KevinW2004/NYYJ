export const createFolder = async (folderPath: string) => {
    const result = await (window as any).api.createFolder(folderPath);
    if (!result.success) {
        throw new Error(result.error);
    }
};

export const createFile = async (filePath: string, data: any) => {
    const result = await (window as any).api.createFile(filePath, data);
    if (!result.success) {
        throw new Error(result.error);
    }
};

export const saveDataToFile = async (filePath: string, data: any) => {
    try {
        // 清理数据
        const cleanedData = JSON.parse(JSON.stringify(data));
        console.log('Saving data:', cleanedData);

        const result = await (window as any).api.saveDataToFile(filePath, cleanedData);
        if (!result.success) {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
};

