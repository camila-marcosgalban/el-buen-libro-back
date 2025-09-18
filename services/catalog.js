
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const catalogPath = path.join(__dirname, 'catalog.json')

export function getCatalog(){
  if (fs.existsSync(catalogPath)){
    return JSON.parse(fs.readFileSync(catalogPath,'utf-8'))
  }
  return {}
}
