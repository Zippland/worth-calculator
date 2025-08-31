FROM nginx

LABEL org.opencontainers.image.authors="<Zihan u7174903@anu.edu.au>"
LABEL org.opencontainers.image.contribute="<Paper-Dragon 2678885646@qq.com>"
ENV TZ=Asia/Shanghai

ADD ./out /usr/share/nginx/html