FROM alpine:latest

RUN apk add --no-cache bc bash curl
RUN adduser -D amber

WORKDIR /home/amber
USER amber

RUN bash -- <(curl -s "https://raw.githubusercontent.com/amber-lang/amber/master/setup/install.sh") --user

ENV PATH="/home/amber/.local/bin:$PATH"
ENV SHELL=/bin/bash
