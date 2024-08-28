FROM armdocker.rnd.ericsson.se/proj-eric-oss-drop/k6-base-image:latest

ARG URL
ARG IAM_URL
ARG GAS_URL

USER root 
RUN mkdir -p /tests/reports
#COPY ../scripts /tests
#COPY ../start_k6.sh /tests
ADD src/initial_install.sh /tests
ADD src/js/ /tests
ADD src/resources/ /resources

WORKDIR /tests

RUN sed -i "s|{}|${URL}|g" ./modules/Constants.js
RUN sed -i "s|--IAM_URL--|${IAM_URL}|g" ./modules/Constants.js
RUN sed -i "s|--GAS_URL--|${GAS_URL}|g" ./modules/Constants.js

ENTRYPOINT ["/bin/sh", "initial_install.sh"]

