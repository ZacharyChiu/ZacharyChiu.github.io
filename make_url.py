import os

def set():
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
	
	
def make_idea():
	with open('main_url_mode.txt','r',encoding='utf-8') as f:
		mode = f.read()
	info = []# url$name$tip$bg
	with open('idea_urls.txt','r',encoding='utf-8') as f:
		lines = f.readlines()
		for l in lines:
			if l != '\n':
				if l[0] != '#':
					info.append(l)
	print('info:\n',info)
	with open('ideas.html','r',encoding='utf-8') as f:
		o_body = f.read()
	thekey = '<!-- $HERE$ -->'
	o_head = o_body.split(thekey)[0]
	o_tail = o_body.split(thekey)[2]
	
	s = []
	for i in info:
		ll = i.split('$')
		url = ll[0]
		tip = ll[1].strip()
		cats = ll[2].strip().replace('.',' cat-')
		cp = mode[:]
		re1 = cp.replace('{{url}}',url)
		re2 = re1.replace('{{tip}}',tip)
		re3 = re2.replace('{{cats}}',cats)
		s.append(re3)
	o_add = '\n\n'.join(s)
	result = o_head + thekey + '\n' +  o_add + '\n\t\t\t\t\t' + thekey + o_tail
	with open('ideas.html','w',encoding='utf-8') as f:
		f.write(result)
	print('\n\n'.join(s))
if __name__ == "__main__":
	make_idea()
