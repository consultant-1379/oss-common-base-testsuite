FROM armdocker.rnd.ericsson.se/proj-eric-oss-drop/k6-base-image:latest

ARG GAS_URL
ARG IAM_URL

USER root
RUN mkdir -p /tests/reports
ADD src/start_k6_gui.sh /tests
ADD src/js/ /tests
ADD src/resources/ /resources
ADD src/config /tests

WORKDIR /tests

RUN sed -i "s|--GAS_URL--|${GAS_URL}|g" ./modules/Constants.js
RUN sed -i "s|--IAM_URL--|${IAM_URL}|g" ./modules/Constants.js

RUN wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
RUN chmod a+x /usr/local/bin/yq

ENTRYPOINT ["/bin/sh", "start_k6_gui.sh"]
