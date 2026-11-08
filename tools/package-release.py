from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
root=Path(__file__).resolve().parents[1]
out=root.parent/'output';out.mkdir(exist_ok=True)
release='A'+json.loads((root/'package.json').read_text())['version'].split('.')[1]
for name,manifest in [('runtime','runtime-files.json'),('source','source-files.json')]:
 paths=json.loads((root/'tools'/manifest).read_text())
 incoming=root/'assets'/'pc-desktop'/'incoming'
 for f in sorted(incoming.glob('*')):
  rel=f.relative_to(root).as_posix()
  if f.is_file() and rel not in paths: paths.append(rel)
 with ZipFile(out/f'2006_{release}_{name}.zip','w',ZIP_DEFLATED,compresslevel=9) as z:
  for p in paths:
   assert (root/p).is_file(),p
   z.write(root/p,f'2006_{release}/'+p)
 print(name,len(paths),(out/f'2006_{release}_{name}.zip').stat().st_size)
