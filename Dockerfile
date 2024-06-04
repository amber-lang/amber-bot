FROM alpine:latest as base

USER root

RUN apk add --no-cache --update bc bash curl
RUN adduser -D amber

WORKDIR /home/amber

USER amber

RUN curl -s "https://raw.githubusercontent.com/Ph0enixKM/AmberNative/master/setup/install.sh" -o install.sh && \
    bash ./install.sh --user && \
    rm install.sh

ENV PATH=$PATH:~/.local/bin
ENV SHELL=/bin/bash
