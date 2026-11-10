import {readFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
const root=new URL('../content/nexus/',import.meta.url)
export async function loadOntology(){return JSON.parse(await readFile(new URL('ontology.json',root),'utf8'))}
export function validateOntology(ontology){
 const errors=[],entities=new Map(ontology.entities.map(e=>[e.id,e]))
 for(const entity of ontology.entities){if(!entity.id||!entity.name||!entity.type)errors.push('Incomplete entity '+entity.id)}
 if(entities.size!==ontology.entities.length)errors.push('Duplicate ontology ID')
 const allowed=new Set(['USES_APPLICATION','PROVIDED_BY','PROTECTS','RELATED_TO','AUTHENTICATES_WITH','AVAILABLE_TO'])
 for(const rel of ontology.relationships){if(!entities.has(rel.subject)||!entities.has(rel.object))errors.push('Broken relationship '+rel.subject+' '+rel.object);if(!allowed.has(rel.predicate))errors.push('Unexpected predicate '+rel.predicate)}
 return errors
}
