import sql from 'mssql';

declare global {
  // Extend the NodeJS.Global interface to include mssqlPool
  // Use sql.ConnectionPool | undefined as the type
  namespace NodeJS {
    interface Global {
      mssqlPool?: sql.ConnectionPool;
    }
  }
}

const config: sql.config = {
 
        "server": process.env.SQL_SERVER as string,
        "authentication": {
            "type": "default",
            "options": {
                "userName": process.env.SQL_USER as string,
                "password": process.env.SQL_PASSWORD as string
            }
        },
        "options": {
            "port": 1433,
            "database": process.env.SQL_DATABASE,
            trustServerCertificate: true,
        }
    
}

export async function getPool(): Promise<sql.ConnectionPool> {
  const g = global as NodeJS.Global;
  if (g.mssqlPool) return g.mssqlPool;
  const pool = await sql.connect(config);
  g.mssqlPool = pool;
  return pool;
}

export { sql };
