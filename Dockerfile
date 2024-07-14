FROM alpine:latest

RUN apk add --no-cache bc bash curl \
    && adduser -D amber \
    && su amber -c "cd ~ && curl -s https://raw.githubusercontent.com/Ph0enixKM/AmberNative/master/setup/install.sh -o install.sh && chmod +x install.sh && bash ./install.sh --user && rm install.sh"

USER amber
WORKDIR /home/amber

ENV PATH="/home/amber/.local/bin:$PATH"
ENV SHELL=/bin/bash

CMD ["/bin/bash"]
