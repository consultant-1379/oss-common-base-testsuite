#!/usr/bin/env groovy

def defaultBobImage = 'armdocker.rnd.ericsson.se/proj-adp-cicd-drop/bob.2.0:1.7.0-55'
def bob2 = new BobCommand()
    .bobImage(defaultBobImage)
    .envVars([
        HOME:'${HOME}',
        ISO_VERSION:'${ISO_VERSION}',
        RELEASE:'${RELEASE}',
        SONAR_HOST_URL:'${SONAR_HOST_URL}',
        SONAR_AUTH_TOKEN:'${SONAR_AUTH_TOKEN}',
        GERRIT_CHANGE_NUMBER:'${GERRIT_CHANGE_NUMBER}',
        KUBECONFIG:'${KUBECONFIG}',
        K8S_NAMESPACE: '${K8S_NAMESPACE}',
        USER:'${USER}',
        SELI_ARTIFACTORY_REPO_USER:'${CREDENTIALS_SELI_ARTIFACTORY_USR}',
        SELI_ARTIFACTORY_REPO_PASS:'${CREDENTIALS_SELI_ARTIFACTORY_PSW}',
        SERO_ARTIFACTORY_REPO_USER:'${CREDENTIALS_SERO_ARTIFACTORY_USR}',
        SERO_ARTIFACTORY_REPO_PASS:'${CREDENTIALS_SERO_ARTIFACTORY_PSW}',
        MAVEN_CLI_OPTS: '${MAVEN_CLI_OPTS}',
        OPEN_API_SPEC_DIRECTORY: '${OPEN_API_SPEC_DIRECTORY}'
    ])
    .needDockerSocket(true)
    .toString()

pipeline {
    agent {
        node {
            label params.NODE_LABEL
        }
        /*parameters {
                    string(name: 'ARMDOCKER_USER_SECRET',
                                    description: 'ARM Docker secret')
                    string(name: 'NAMESPACE',
                                    description: 'Namespace to install the EO Chart' )
                    string(name: 'KUBECONFIG_FILE',
                                    description: 'Kubernetes configuration file to specify which environment to install on' )
                    string(name: 'AGENT_LABEL',
                                    defaultValue: 'evo_docker_engine',
                                    description: 'Label of agent which be used')
        }*/
    }

/*    environment {
	        bob2 = "docker run --rm " +
                '--workdir "`pwd`" ' +
                "-w `pwd` " +
                "-v \"`pwd`:`pwd`\" " +
                "-v /var/run/docker.sock:/var/run/docker.sock " +
                "armdocker.rnd.ericsson.se/proj-adp-cicd-drop/bob.2.0:1.7.0-55"
    } */

    stages {
        stage('Configure') {
            steps {
                sh "git submodule add -f ssh://gerrit-gamma.gic.ericsson.se:29418/adp-cicd/bob bob"
                sh "git submodule update --init --recursive"
                sh "git config submodule.bob.ignore all"
            }
        }

        stage('Clean') {
            steps {
                sh "docker run hello-world"
                sh "${bob2} clean"
            }
        }

        stage('Build image') {
            steps {
                sh "${bob2} build"
            }
        }

        stage('Run test') {
            steps {
                //sh "${bob2} push"
                //sh "docker run -v ${WORKSPACE}/scripts:/src armdocker.rnd.ericsson.se/dockerhub-ericsson-remote/loadimpact/k6 run /src/BP-BFP-001.js"
                echo 'Run test'
            }
        }

    }
    post {
        always {
          //sh "${bob2} helm-delete"
          //  cucumber 'nbitestsuite/conftest/*.json'
          echo 'ok'
        }
    }
}

// More about @Builder: http://mrhaki.blogspot.com/2014/05/groovy-goodness-use-builder-ast.html
import groovy.transform.builder.Builder
import groovy.transform.builder.SimpleStrategy

@Builder(builderStrategy = SimpleStrategy, prefix = '')
class BobCommand {
    def bobImage = 'bob.2.0:latest'
    def envVars = [:]
    def needDockerSocket = false

    String toString() {
        def env = envVars
                .collect({ entry -> "-e ${entry.key}=\"${entry.value}\"" })
                .join(' ')

        def cmd = """\
            |docker run
            |--init
            |--rm
            |--workdir \${PWD}
            |--user \$(id -u):\$(id -g)
            |-v \${PWD}:\${PWD}
            |-v /etc/group:/etc/group:ro
            |-v /etc/passwd:/etc/passwd:ro
            |-v \${HOME}:\${HOME}
            |${needDockerSocket ? '-v /var/run/docker.sock:/var/run/docker.sock' : ''}
            |${env}
            |\$(for group in \$(id -G); do printf ' --group-add %s' "\$group"; done)
            |--group-add \$(stat -c '%g' /var/run/docker.sock)
            |${bobImage}
            |"""
        return cmd
                .stripMargin()           // remove indentation
                .replace('\n', ' ')      // join lines
                .replaceAll(/[ ]+/, ' ') // replace multiple spaces by one
    }
}
