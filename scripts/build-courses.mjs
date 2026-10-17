import { spawnSync } from 'node:child_process';
import { mkdtempSync, cpSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Four static Next exports. No server, cookies or runtime routing required.
const stage = mkdtempSync(join(tmpdir(),'lettoria-courses-'));
try {
 for(const course of ['nl','be','de','ch']) {
  console.log(`\nExporting Lettoria: ${course}`);
  // Nixpacks mounts .next/cache: clear its contents, never remove the mount.
  if (existsSync('.next')) {
   for (const entry of readdirSync('.next')) {
    const path = join('.next', entry);
    if (entry === 'cache') {
     for (const cached of readdirSync(path)) rmSync(join(path, cached), { recursive: true, force: true });
    } else rmSync(path, { recursive: true, force: true });
   }
  }
  rmSync('out',{recursive:true,force:true});
  const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build'],{stdio:'inherit',env:{...process.env,NEXT_PUBLIC_LETTORIA_COURSE:course}});
  if(result.status!==0)throw Error(`Export failed for ${course}`);
  cpSync('out',join(stage,course),{recursive:true});
 }
 rmSync('out',{recursive:true,force:true});
 cpSync(join(stage,'nl'),'out',{recursive:true});
 for(const course of ['be','de','ch']) {
  cpSync(join(stage,course),join('out',course),{recursive:true});
  // Next's home-link prefetch requests /de.txt for a basePath-mounted export.
  cpSync(join(stage,course,'index.txt'),join('out',`${course}.txt`));
 }
 console.log('Exported NL QWERTY + BE AZERTY + DE QWERTZ + CH QWERTZ into out/.');
} finally { rmSync(stage,{recursive:true,force:true}); }
