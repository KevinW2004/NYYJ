let isFileOperationInProgress = false;  // 互斥锁标志

// Helper function to acquire the lock
const acquireLock = async (): Promise<void> => {
    while (isFileOperationInProgress) {
        // 等待直到锁被释放
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    isFileOperationInProgress = true;
};

// Helper function to release the lock
const releaseLock = (): void => {
    isFileOperationInProgress = false;
};

export const deleteFile = async (filePath: string) => {
    await acquireLock();  // 等待锁

    try {
        const result = await (window as any).api.deleteFile(filePath);
        if (!result.success) {
            throw new Error(result.error);
        }
    } finally {
        releaseLock();  // 释放锁
    }
};

export const checkFileExist = async (filePath: string) => {
    await acquireLock();  // 等待锁

    try {
        const result = await (window as any).api.checkFileExist(filePath);
        if (!result.success) {
            throw new Error(result.error);
        }
        return result.exists;
    } finally {
        releaseLock();  // 释放锁
    }
};

export const createFolder = async (folderPath: string) => {
    await acquireLock();  // 等待锁

    try {
        const result = await (window as any).api.createFolder(folderPath);
        if (!result.success) {
            throw new Error(result.error);
        }
    } finally {
        releaseLock();  // 释放锁
    }
};

export const createFile = async (filePath: string, data: any) => {
    await acquireLock();  // 等待锁

    try {
        const result = await (window as any).api.createFile(filePath, data);
        if (!result.success) {
            throw new Error(result.error);
        }
    } finally {
        releaseLock();  // 释放锁
    }
};

export const saveDataToFile = async (filePath: string, data: any) => {
    await acquireLock();  // 等待锁

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
    } finally {
        releaseLock();  // 释放锁
    }
};

export const readFile = async (filePath: string): Promise<any> => {
    await acquireLock();  // 等待锁

    try {
        const result = await (window as any).api.readFile(filePath);
        if (!result.success) {
            throw new Error(result.error);
        }
        return result.data; // 返回读取的数据
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    } finally {
        releaseLock();  // 释放锁
    }
};
