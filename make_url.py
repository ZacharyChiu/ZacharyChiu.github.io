import os

with open('main_url_mode.txt','r',encoding='utf-8') as f:
	mode = f.read()

info = []# url$name$tip$bg
with open('urls.txt','r',encoding='utf-8') as f:
	lines = f.readlines()
	for l in lines:
		if l != '\n':
			if l[0] != '#':
				info.append(l)

s = []
for i in info:
	ll = i.split('$')
	url = ll[0]
	name = ll[1]
	tip = ll[2]
	bg = ll[3]
	cats = ll[4].strip().replace('.',' cat-')
	cp = mode[:]
	re1 = cp.replace('{{url}}',url)
	re2 = re1.replace('{{name}}',name)
	re3 = re2.replace('{{tip}}',tip)
	re4 = re3.replace('{{bg}}',bg)
	re5 = re4.replace('{{cats}}',cats)
	s.append(re3)
with open('mode_result.txt','w',encoding='utf-8') as f:
    f.write('\n\n'.join(s))
print('\n\n'.join(s[:10]))