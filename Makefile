.PHONY: clean all

server: clean
	npm run build && hexo server

server-skip: clean  
	hexo generate && hexo server
	
clean:
	hexo clean