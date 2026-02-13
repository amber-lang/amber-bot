ARG BASE_BASH_IMAGE=5.2-alpine3.22
FROM --platform=linux/amd64 bash:$BASE_BASH_IMAGE

RUN apk add --no-cache bc bash curl
RUN adduser -D amber

WORKDIR /home/amber
USER amber

RUN bash -- <(curl -sL "https://github.com/amber-lang/amber/releases/download/0.5.1-alpha/install.sh") --user


ENV PATH="/home/amber/.local/bin:$PATH"
ENV SHELL=/bin/bash
