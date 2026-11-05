"""Contact sheet: sheet.py OUT COLS TILE_W TILE_H FILE..."""
import sys,os
from PIL import Image,ImageDraw
out,cols,tw,th=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4]);files=sys.argv[5:]
rows=(len(files)+cols-1)//cols;S=Image.new('RGB',(cols*tw,rows*th),(20,20,20));D=ImageDraw.Draw(S)
for i,f in enumerate(files):
    try:
        im=Image.open(f).convert('RGBA');bg=Image.new('RGBA',im.size,(255,255,255,255));bg.alpha_composite(im);im=bg.convert('RGB')
        r=max(tw/im.width,th/im.height);im=im.resize((int(im.width*r)+1,int(im.height*r)+1));l=(im.width-tw)//2;t=(im.height-th)//2;im=im.crop((l,t,l+tw,t+th))
        S.paste(im,((i%cols)*tw,(i//cols)*th))
    except Exception: pass
    n=os.path.basename(f).rsplit('.',1)[0];x,y=(i%cols)*tw+3,(i//cols)*th+2;D.text((x+1,y+1),n,fill=(0,0,0));D.text((x,y),n,fill=(255,235,120))
S.save(out,quality=86)
