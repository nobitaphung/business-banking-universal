@Library('jenkins-shared-library@latest') l1

def chartsToPublish = []

pipeline {
  agent {
    label 'kaniko'
  }

  environment {
    HARBOR_PROJECT = "staging"
  }

  stages {
    stage ('Initialize') {
      steps {
        script {

          withCredentials([
            usernamePassword(
              credentialsId: 'harbor-credentials',
              usernameVariable: 'HARBOR_HELM_REPO_USERNAME',
              passwordVariable: 'HARBOR_HELM_REPO_PASSWORD')
          ]) {
            sh """
              helm init --client-only
              helm repo add ${HARBOR_PROJECT} https://harbor.backbase.eu/chartrepo/${HARBOR_PROJECT} --username "${HARBOR_HELM_REPO_USERNAME}" --password "${HARBOR_HELM_REPO_PASSWORD}"
              helm plugin install https://github.com/chartmuseum/helm-push
            """
          }
           withCredentials([
              usernamePassword(
                credentialsId: 'artifactory_auto-test', 
                usernameVariable: 'artuser', 
                passwordVariable: 'artpassword')
          ]) {
            sh "helm repo add backbase-charts https://repo.backbase.com/backbase-charts --username \"${artuser}\" --password \"${artpassword}\""
          }
        }
      }
    }

    stage ('Lint Helm Chart') {
      steps {
        script {
          sh "helm lint ./chart/banking-apps-config-server"
          sh "helm dependency update ./chart/banking-apps-config-server"
        }
      }
    }

    stage ('Publish Helm Chart') {
        steps {
            script {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'harbor-credentials',
                        usernameVariable: 'HARBOR_HELM_REPO_USERNAME',
                        passwordVariable: 'HARBOR_HELM_REPO_PASSWORD')
                ]) {
                    sh """
                        helm push ./chart/banking-apps-config-server \
                            https://harbor.backbase.eu/chartrepo/${HARBOR_PROJECT} \
                            --username "${HARBOR_HELM_REPO_USERNAME}" --password "${HARBOR_HELM_REPO_PASSWORD}"
                    """
                }
            }
        }
    }
  }
}