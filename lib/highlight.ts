const KEYWORDS = [
  'SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','INNER','OUTER','CROSS',
  'ON','GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET','AS','AND','OR',
  'NOT','IN','EXISTS','BETWEEN','LIKE','IS','NULL','DISTINCT','WITH',
  'UNION','ALL','DESC','ASC','CASE','WHEN','THEN','ELSE','END',
]

const FUNCTIONS = [
  'COUNT','SUM','AVG','MAX','MIN','COALESCE','NOW','DATE','YEAR','MONTH',
  'CONCAT','IFNULL','ISNULL','DATEADD','DATEDIFF','ROUND','FLOOR','CEIL',
  'LENGTH','UPPER','LOWER','TRIM','SUBSTRING','CAST','CONVERT',
]

export function highlightSQL(sql: string): string {
  // Escape HTML
  let result = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Comments
  result = result.replace(
    /(--[^\n]*)/g,
    '<span class="text-gray-400 italic">$1</span>'
  )

  // String literals
  result = result.replace(
    /('[^']*')/g,
    '<span class="text-amber-700">$1</span>'
  )

  // SQL keywords
  const kwPattern = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'gi')
  result = result.replace(
    kwPattern,
    '<span class="text-blue-700 font-medium">$1</span>'
  )

  // SQL functions
  const fnPattern = new RegExp(`\\b(${FUNCTIONS.join('|')})\\b`, 'gi')
  result = result.replace(
    fnPattern,
    '<span class="text-teal-700">$1</span>'
  )

  return result
}
