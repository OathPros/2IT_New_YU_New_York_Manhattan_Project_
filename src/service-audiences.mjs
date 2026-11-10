const audienceMap = {
  'email':['student','employee'],
  '1password':['student','employee'],
  'duo':['student','employee'],
  'passport-york':['student','employee'],
  'connectivity':['student','employee'],
  'software':['student','employee'],
  'microsoft-365':['student','employee'],
  'teaching-learning':['student','employee'],
  'printing':['student','employee'],
  'storage':['student','employee'],
  'devices-labs':['student','employee'],
  'security':['student','employee'],
  'ai':['student','employee'],
  'administrative-systems':['employee'],
  'web-media':['employee'],
  'servers':['employee'],
  'audio-visual':['employee'],
  'data-reporting':['employee'],
  'computer-purchase':['employee'],
  'phones':['employee'],
  'github':['employee'],
  'support':['student','employee']
}
export const serviceAudiences=Object.freeze(audienceMap)
export function audiencesForService(service){
 const roles=serviceAudiences[service.id]
 if(!roles)throw new Error('Unknown service audience for '+service.id)
 return roles
}
