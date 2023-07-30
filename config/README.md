# Documentation on Confluence can be found here: https://backbase.atlassian.net/wiki/spaces/BUSB/pages/2418507947/Banking+App+Config+Server

## Version 2.5 Git Bankend

The new update of config server will now use Github as the backend. You can find the configs in this repo: https://github.com/backbase-rnd/pa-banking-apps-configs

For more on the changes you can view the documentation here: https://backbase.atlassian.net/wiki/spaces/BUSB/pages/4051927158/Modelbank+Config+Management

## Version updates

The POM version needs to be set as the newest version
```bash 
x.x.xx-snapshot
```

Docker image verson is set to the current version which is also the Pom version. This way, when a developer wants to troubleshoot, he/she can search the corresponding version in the repo.

This is happening dynamically

Version of  [Docker Image](https://github.com/backbase-rnd/pa-banking-apps-config-server/blob/main/jenkins/Jenkinsfile#L87):

```bash
releaseDockerTag = version.minus('-SNAPSHOT')
```

The exact same [value](https://github.com/backbase-rnd/pa-banking-apps-config-server/blob/main/jenkins/Jenkinsfile#L124-L126) is also set on the Tag:
```bash
mvn -Dtag="${releaseDockerTag}" scm:tag
```
