# DevSecOps Demo Package (FULL)
This package contains a ready-to-use Node.js demo app and CI/CD artifacts (Jenkinsfile, scanner configs, scripts)
targeted for a Windows Jenkins + Docker Desktop environment.

## Contents
- app.js: Node.js Express demo app (includes a reflected XSS endpoint `/hello` for testing)
- package.json: dependencies and start script
- Dockerfile: lightweight Alpine Node image
- sonar-project.properties: Sonar project config
- Jenkinsfile: full pipeline (Checkout, Install, SAST, SCA, Build image, Deploy, DAST)
- depcheck.bat: runs OWASP Dependency-Check via Docker and outputs HTML into `reports/`
- zap_scan.bat: runs OWASP ZAP baseline scan via Docker and outputs reports into `reports/`
- README.md: this file

## Quick start (Windows host)
1. Install prerequisites:
   - Docker Desktop (running)
   - Jenkins (running as service or in Docker)
   - Node.js (for local testing)
2. Place this repo on your Jenkins workspace (or push to GitHub and point a Jenkins job at it).
3. In Jenkins:
   - Create credential (Secret text) with ID `sonar-token` containing your Sonar token.
   - Create credential for Git (optional) `github-token` if repo is private.
   - Configure SonarQube server in Manage Jenkins -> Configure System -> SonarQube servers with name `sonarqube` and URL `http://localhost:9000`.
   - Install Sonar Scanner on Jenkins machine and add to PATH (or configure Global Tool and name it `sonar-scanner`).
4. Pull required Docker images (recommended):
   docker pull owasp/dependency-check
   docker pull zaproxy/zap-stable
   docker pull sonarsource/sonar-scanner-cli
5. Run the pipeline job on Jenkins (pipeline reads this Jenkinsfile).

## Reports
After a successful run, reports will be available in the `reports/` folder and archived by Jenkins:
- dependency-check-report.html
- zap_report.html, zap_report.json

## Notes
- This package intentionally uses a vulnerable dependency (lodash 4.17.19) for demo SCA results.
- For ZAP to reach your app when Jenkins runs inside a container or on host, use `host.docker.internal` as target host in the ZAP command.
