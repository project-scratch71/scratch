/**
 * IndexedDB 辅助函数
 * 提供与 IndexedDB 交互的功能，用于存储聊天历史和设置
 */

// 数据库名称和版本
const DB_NAME = 'scratch-chat-db';
const DB_VERSION = 1;

// 对象存储的名称
const STORES = {
    CHAT_HISTORY: 'chatHistory',
    SETTINGS: 'settings'
};

/**
 * 初始化数据库
 * @returns {Promise<IDBDatabase>} 返回数据库实例
 */
const initDB = () => {
    return new Promise((resolve, reject) => {
        // 如果不在浏览器环境，返回 null
        if (typeof indexedDB === 'undefined') {
            console.warn('IndexedDB is not supported in this environment');
            return resolve(null);
        }
        
        // 打开数据库
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        // 处理数据库版本升级
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // 创建聊天历史对象存储
            if (!db.objectStoreNames.contains(STORES.CHAT_HISTORY)) {
                const chatHistoryStore = db.createObjectStore(STORES.CHAT_HISTORY, { keyPath: 'timestamp' });
                chatHistoryStore.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('创建聊天历史存储');
            }
            
            // 创建设置对象存储
            if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                console.log('创建设置存储');
            }
        };
        
        // 处理成功和错误
        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log('数据库初始化成功');
            resolve(db);
        };
        
        request.onerror = (event) => {
            console.error('数据库初始化失败:', event.target.error);
            reject(event.target.error);
        };
    });
};

/**
 * 保存聊天输入历史
 * @param {string} input 用户输入文本
 * @param {number} maxItems 最大保存数量
 * @returns {Promise<void>}
 */
const saveInputHistory = async (input, maxItems = 100) => {
    if (!input || input.trim() === '') return;
    
    try {
        const db = await initDB();
        if (!db) return;
        
        const transaction = db.transaction([STORES.CHAT_HISTORY], 'readwrite');
        const store = transaction.objectStore(STORES.CHAT_HISTORY);
        
        // 检查是否重复并管理历史记录大小
        const checkAndSave = async () => {
            return new Promise((resolve, reject) => {
                const allHistoryRequest = store.index('timestamp').getAll();
                
                allHistoryRequest.onsuccess = () => {
                    const allHistory = allHistoryRequest.result;
                    
                    // 如果有历史记录，检查最近的一条是否与当前输入相同
                    if (allHistory.length > 0) {
                        // 按时间排序（最旧的在前面）
                        allHistory.sort((a, b) => a.timestamp - b.timestamp);
                        
                        // 检查最近的一条记录
                        const mostRecent = allHistory[allHistory.length - 1];
                        if (mostRecent && mostRecent.text === input) {
                            // 如果与最近记录相同，不保存
                            console.log('跳过保存重复的输入历史');
                            resolve();
                            return;
                        }
                        
                        // 如果超过最大数量，删除旧的
                        if (allHistory.length >= maxItems) {
                            // 需要删除的记录数量
                            const toDelete = allHistory.length - maxItems + 1; // +1 为即将添加的新记录留出空间
                            
                            // 删除最旧的记录
                            for (let i = 0; i < toDelete; i++) {
                                store.delete(allHistory[i].timestamp);
                            }
                        }
                    }
                    
                    // 添加新输入到历史记录
                    const addRequest = store.add({
                        text: input,
                        timestamp: Date.now()
                    });
                    
                    addRequest.onsuccess = () => resolve();
                    addRequest.onerror = (e) => reject(e.target.error);
                };
                
                allHistoryRequest.onerror = (e) => reject(e.target.error);
            });
        };
        
        await checkAndSave();
        
        // 此处已由上面的 checkAndSave 函数处理
        
    } catch (error) {
        console.error('保存聊天历史失败:', error);
    }
};

/**
 * 获取聊天输入历史
 * @returns {Promise<Array>} 历史输入数组
 */
const getInputHistory = async () => {
    try {
        const db = await initDB();
        if (!db) return [];
        
        const transaction = db.transaction([STORES.CHAT_HISTORY], 'readonly');
        const store = transaction.objectStore(STORES.CHAT_HISTORY);
        
        return new Promise((resolve, reject) => {
            const request = store.index('timestamp').getAll();
            
            request.onsuccess = () => {
                // 返回排序后的数组（最新的在后面）
                const histories = request.result;
                histories.sort((a, b) => a.timestamp - b.timestamp);
                resolve(histories.map(h => h.text));
            };
            
            request.onerror = (event) => {
                console.error('获取聊天历史失败:', event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('获取聊天历史失败:', error);
        return [];
    }
};

/**
 * 保存设置
 * @param {string} key 设置键
 * @param {any} value 设置值
 * @returns {Promise<void>}
 */
const saveSetting = async (key, value) => {
    if (!key) return;
    
    try {
        const db = await initDB();
        if (!db) return;
        
        const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
        const store = transaction.objectStore(STORES.SETTINGS);
        
        // 使用 put 方法添加或更新设置
        store.put({
            key,
            value,
            timestamp: Date.now()
        });
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = event => reject(event.target.error);
        });
    } catch (error) {
        console.error(`保存设置 ${key} 失败:`, error);
    }
};

/**
 * 获取设置
 * @param {string} key 设置键
 * @returns {Promise<any>} 设置值
 */
const getSetting = async (key) => {
    if (!key) return null;
    
    try {
        const db = await initDB();
        if (!db) return null;
        
        const transaction = db.transaction([STORES.SETTINGS], 'readonly');
        const store = transaction.objectStore(STORES.SETTINGS);
        
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            
            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            
            request.onerror = (event) => {
                console.error(`获取设置 ${key} 失败:`, event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error(`获取设置 ${key} 失败:`, error);
        return null;
    }
};

/**
 * 保存大模型设置到 IndexedDB
 * @param {Object} settings 大模型设置
 * @returns {Promise<void>}
 */
const saveModelSettings = async (settings) => {
    return saveSetting('deepseekSettings', settings);
};

/**
 * 获取大模型设置
 * @returns {Promise<Object|null>} 大模型设置对象
 */
const getModelSettings = async () => {
    return getSetting('deepseekSettings');
};

/**
 * 清空聊天输入历史
 * @returns {Promise<boolean>} 是否成功清空
 */
const clearInputHistory = async () => {
    try {
        const db = await initDB();
        if (!db) return false;
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CHAT_HISTORY], 'readwrite');
            const store = transaction.objectStore(STORES.CHAT_HISTORY);
            
            // 清空历史记录
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => {
                console.log('聊天输入历史已清空');
                resolve(true);
            };
            
            clearRequest.onerror = (event) => {
                console.error('清空聊天历史失败:', event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('清空聊天历史失败:', error);
        return false;
    }
};

export default {
    saveInputHistory,
    getInputHistory,
    saveSetting,
    getSetting,
    saveModelSettings,
    getModelSettings,
    clearInputHistory
};
