#FROM armdocker.rnd.ericsson.se/proj-eric-oss-drop/k6-base-image:latest
FROM armdocker.rnd.ericsson.se/proj-eric-oss-drop/k6/tooling/k6-build-base-image:latest
#FROM armdocker.rnd.ericsson.se/proj-eric-oss-drop/k6/tooling/k6-base-image:latest

ARG URL
ARG IAM_URL
ARG GAS_URL
ARG BDR_HOST

ENV GAS_USER_USERNAME=''
ENV GAS_USER_PASSWORD=''

USER root
RUN mkdir -p /tests/reports
ADD src/start_k6.sh /tests
ADD src/setCertMReplicas.sh /tests
ADD src/getServiceLogs.sh /tests
ADD src/debug_logs.sh /tests
ADD src/removeJaegerFile.sh /tests
ADD src/setDST.sh /tests
ADD src/setLogginStack.sh /tests
ADD src/setNewDashboard.sh /tests
ADD src/printPGs.sh /tests
ADD src/js/ /tests
ADD src/resources/ /resources
ADD src/config /tests

WORKDIR /tests

RUN apk --no-cache add curl
RUN apk --no-cache add openssl
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin

RUN curl -fsSL -o helm.tar.gz https://get.helm.sh/helm-$(wget https://github.com/helm/helm/releases/latest --server-response -O /dev/null 2>&1 | awk '/^  Location: /{DEST=$2} END{ print DEST}' | grep -oE "[^/]+$")-linux-amd64.tar.gz
RUN tar zxvf helm.tar.gz
RUN chmod +x linux-amd64/helm
RUN mv linux-amd64/helm /usr/local/bin
RUN rm -rf linux-amd64
RUN rm -rf helm.tar.gz

RUN sed -i "s|{}|${URL}|g" ./modules/Constants.js
RUN sed -i "s|--IAM_URL--|${IAM_URL}|g" ./modules/Constants.js
RUN sed -i "s|--GAS_URL--|${GAS_URL}|g" ./modules/Constants.js
RUN sed -i "s|--BDR_HOST--|${BDR_HOST}|g" ./modules/Constants.js

ENTRYPOINT ["/bin/sh", "start_k6.sh"]
