ARG BASE_BASH_IMAGE=5.2-alpine3.21
FROM --platform=linux/amd64 bash:$BASE_BASH_IMAGE-alpine3.21

RUN apk add --no-cache bc bash curl
RUN adduser -D amber

WORKDIR /home/amber
USER amber

RUN bash -- <(curl -s "https://raw.githubusercontent.com/amber-lang/amber/master/setup/install.sh") --user

ENV PATH="/home/amber/.local/bin:$PATH"
ENV SHELL=/bin/bash
