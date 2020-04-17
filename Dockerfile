FROM ubuntu:18.04

RUN cd /etc/apt && \
  sed -i 's/archive.ubuntu.com/ftp.kaist.ac.kr/g' sources.list && \
  apt-get update && \
  apt-get upgrade -y && \
  apt-get install -y curl bash git && \
  curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
  apt-get install -y nodejs

ADD . /opt/ga-proxy

WORKDIR /opt/ga-proxy
RUN npm install

ENV APP_ENV docker
ENV APP_NAME ga-proxy
ENV CONFIG_FILE config.json
ENV PORT 7020
ENV DOMAIN localhost

EXPOSE 7020
CMD ["npm", "start"]
