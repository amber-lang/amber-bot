# Use a base image with shell capabilities
FROM alpine:latest

# Install necessary packages
RUN apk add --no-cache bash curl bc sed

# Create directory for amber
RUN mkdir -p /opt/amber

# Install amber (replace with actual installation command if different)
RUN curl -s "https://raw.githubusercontent.com/Ph0enixKM/AmberNative/master/setup/install.sh" | bash

# Set default command to bash
CMD ["bash"]
