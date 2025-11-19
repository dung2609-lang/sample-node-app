pipeline {
    agent any

    environment {
        GIT_URL = 'https://github.com/dung2609-lang/sample-node-app.git'
        GIT_BRANCH = 'main'
        SONAR_TOKEN = credentials('sonar-token')   // Sonar token in Jenkins credentials
        DOCKER_IMAGE = "sample-node-app:${env.BUILD_NUMBER}"
        APP_CONTAINER = "sample-node-container"
        APP_PORT = "3000"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checkout source'
                git branch: "${GIT_BRANCH}", url: "${GIT_URL}", credentialsId: 'github-token'
            }
        }

        stage('Install') {
            steps {
                echo 'Install npm dependencies'
                bat 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Build Docker image'
                bat "docker build -t %DOCKER_IMAGE% ."
            }
        }

        stage('Deploy - Run App') {
            steps {
                echo 'Stop & remove old container (if any)'
                bat "docker stop %APP_CONTAINER% || echo no-container"
                bat "docker rm %APP_CONTAINER% || echo no-container"
                echo 'Run new container'
                bat "docker run -d --name %APP_CONTAINER% -p %APP_PORT%:3000 %DOCKER_IMAGE%"
                echo 'Wait for app to start'
                bat "timeout /t 5 /nobreak >nul"
            }
        }

        stage('SAST - SonarQube') {
            steps {
                echo 'Run SonarQube analysis'
                withSonarQubeEnv('sonarqube') {
                    // use sonar-scanner installed in Jenkins; if not available use docker (comment alternative below)
                    bat "sonar-scanner -Dsonar.projectKey=sample-node-app -Dsonar.sources=. -Dsonar.host.url=http://localhost:9000 -Dsonar.login=%SONAR_TOKEN%"
                    // Alternative using docker scanner (if sonar-scanner not installed):
                    // bat "docker run --rm -v %cd%:/usr/src sonarsource/sonar-scanner-cli -Dsonar.projectKey=sample-node-app -Dsonar.sources=/usr/src -Dsonar.host.url=http://host.docker.internal:9000 -Dsonar.login=%SONAR_TOKEN%"
                }
            }
        }

        stage('SCA - Dependency-Check') {
            steps {
                echo 'Run OWASP Dependency-Check (docker)'
                // Use full path if needed: set CURR=%cd% then mount "%CURR%":/src
                bat 'set CURR=%cd% && docker run --rm -v "%CURR%":/src owasp/dependency-check --project sample-node-app --scan /src --format "HTML" --out /src/dependency-check-report'
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                echo 'Run OWASP ZAP baseline scan (docker)'
                // host.docker.internal used for Docker Desktop on Windows to reach host services
                bat 'set CURR=%cd% && docker run --rm -v "%CURR%":/zap/wrk/:rw zaproxy/zap-stable zap-baseline.py -t http://host.docker.internal:3000 -r zap_report.html -J zap_report.json'
            }
        }
    }

    post {
        always {
            echo 'Archive and publish reports'
            // archive artifacts
            archiveArtifacts artifacts: 'dependency-check-report/**, zap_report.html, zap_report.json', allowEmptyArchive: true, fingerprint: true

            // publish HTML reports (requires HTML Publisher plugin)
            publishHTML(target: [
              allowMissing: true,
              alwaysLinkToLastBuild: true,
              keepAll: true,
              reportDir: 'dependency-check-report',
              reportFiles: 'dependency-check-report.html',
              reportName: 'Dependency-Check Report'
            ])
            publishHTML(target: [
              allowMissing: true,
              alwaysLinkToLastBuild: true,
              keepAll: true,
              reportDir: '.',
              reportFiles: 'zap_report.html',
              reportName: 'ZAP Baseline Report'
            ])
        }
        failure {
            echo 'Build failed - check console and reports.'
        }
    }
}
