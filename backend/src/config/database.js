const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.join(__dirname, '..', '..', 'database', 'satellite_assistant.db');
const dbDir = path.dirname(dbPath);

// 确保数据库目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 数据库实例（异步初始化后赋值）
let dbInstance = null;

/**
 * 初始化数据库（异步）
 */
async function initDatabase() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  // 如果数据库文件已存在则加载，否则创建新数据库
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // 启用外键约束
  dbInstance.run('PRAGMA foreign_keys = ON');

  // 读取并执行建表 SQL
  const initSqlPath = path.join(__dirname, '..', '..', 'database', 'init.sql');
  if (fs.existsSync(initSqlPath)) {
    const initSql = fs.readFileSync(initSqlPath, 'utf-8');
    dbInstance.run(initSql);
    console.log('✅ 数据库表初始化完成');
  } else {
    console.warn('⚠️ 未找到初始化SQL文件:', initSqlPath);
  }

  return dbInstance;
}

/**
 * 将数据库保存到磁盘
 */
function saveDatabase() {
  if (!dbInstance) return;
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

/**
 * 获取数据库实例（同步版本，确保初始化完成后调用）
 */
function getDb() {
  return dbInstance;
}

/**
 * 封装兼容 better-sqlite3 风格的 prepare 接口
 * 返回一个支持 .get() .all() .run() 的对象
 */
function prepare(sql) {
  const stmt = dbInstance.prepare(sql);
  return {
    get(...params) {
      if (params.length > 0) stmt.bind(params);
      const hasRow = stmt.step();
      const result = hasRow ? stmt.getAsObject() : undefined;
      stmt.reset();
      return result;
    },
    all(...params) {
      if (params.length > 0) stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.reset();
      return results;
    },
    run(...params) {
      if (params.length > 0) stmt.bind(params);
      // 对于 INSERT/UPDATE/DELETE，step 执行并返回受影响行数信息
      stmt.step();
      const changes = dbInstance.getRowsModified();
      stmt.reset();
      return { changes, lastInsertRowid: -1 };
    }
  };
}

// 直接在 db 对象上挂载兼容方法
const dbProxy = {
  prepare,
  run(sql) {
    dbInstance.run(sql);
    return { changes: dbInstance.getRowsModified() };
  },
  exec(sql) {
    dbInstance.run(sql);
  },
  pragma(cmd) {
    dbInstance.run(`PRAGMA ${cmd}`);
  },
  // 事务封装：sql.js 不支持原生事务，手动用 BEGIN/COMMIT/ROLLBACK 模拟
  transaction(fn) {
    return function(...args) {
      dbInstance.run('BEGIN TRANSACTION');
      try {
        const result = fn.apply(this, args);
        dbInstance.run('COMMIT');
        return result;
      } catch (error) {
        dbInstance.run('ROLLBACK');
        throw error;
      }
    };
  },
  get rawDB() {
    return dbInstance;
  }
};

module.exports = dbProxy;
module.exports.initDatabase = initDatabase;
module.exports.saveDatabase = saveDatabase;
module.exports.getDb = getDb;
