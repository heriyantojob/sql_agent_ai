import { Table, Column } from '@/app/types'

// Kata kunci SQL yang DIBLOKIR di sisi client sebelum request dikirim
export const BLOCKED_PATTERNS =
  /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE|GRANT|REVOKE|RENAME|REPLACE|MERGE|CALL|LOAD\s+DATA)\b/i

export function isDestructiveQuery(sql: string): boolean {
  return BLOCKED_PATTERNS.test(sql)
}

// Parse CREATE TABLE statements dari raw SQL schema string
export function parseSchema(sql: string): Table[] {
  const tables: Table[] = []
  const tableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([^;]+)\)/gi
  let m: RegExpExecArray | null

  while ((m = tableRegex.exec(sql)) !== null) {
    const name = m[1]
    const body = m[2]
    const cols: Column[] = []

    body.split('\n').forEach((line) => {
      line = line.trim().replace(/,$/, '')
      if (!line) return

      const upper = line.toUpperCase()
      if (
        upper.startsWith('PRIMARY KEY') ||
        upper.startsWith('FOREIGN KEY') ||
        upper.startsWith('UNIQUE') ||
        upper.startsWith('INDEX') ||
        upper.startsWith('CONSTRAINT') ||
        upper.startsWith('KEY')
      ) return

      const parts = line.split(/\s+/)
      if (parts.length < 2) return

      const colName = parts[0]
      const colType = parts[1]?.replace(/\(.*\)/, '') || ''
      const isPK = upper.includes('PRIMARY KEY')

      if (colName && colName !== 'CONSTRAINT') {
        cols.push({ name: colName, type: colType.toLowerCase(), pk: isPK })
      }
    })

    if (cols.length > 0) tables.push({ name, cols })
  }

  return tables
}

export const DEMO_SCHEMA = `CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  created_at DATETIME,
  is_active BOOLEAN DEFAULT 1
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total DECIMAL(12,2),
  status VARCHAR(20),
  created_at DATETIME
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(200),
  price DECIMAL(10,2),
  category VARCHAR(50),
  stock INT DEFAULT 0
);

CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  qty INT,
  unit_price DECIMAL(10,2)
);`
