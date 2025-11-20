pipeline {
    agent any

    environment {
        SONAR_TOKEN = 'sonar-token'  // Thay bằng token thật của bạn
        SONAR_HOST = 'http://localhost:9000'
        DEP_CHECK_PATH = 'C:\\tools\\dependency-check'  // Thay bằng path Dependency-Check CLI của bạn
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/dung2609-lang/sample-node-app.git'
            }
        }

        stage('Build') {
            steps {
                bat 'npm install'
            }
        }

        stage('SAST - SonarQube') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        bat "${scannerHome}\\bin\\sonar-scanner.bat -Dsonar.projectKey=sample-node-app -Dsonar.sources=. -Dsonar.host.url=${SONAR_HOST} -Dsonar.login=${SONAR_TOKEN}"
                    }
                }
            }
        }

        stage('SCA - Dependency-Check') {
            steps {
                script {
                    bat "${DEP_CHECK_PATH}\\bin\\dependency-check.bat --project sample-node-app --scan . --out reports --format HTML"
                }
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,    
                    reportDir: 'reports',
                    reportFiles: 'dependency-check-report.html',
                    reportName: 'SCA Report'
                ])
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                script {
                    bat 'docker run --rm -v %WORKSPACE%:/zap/wrk owasp/zap2docker-stable zap-baseline.py -t http://host.docker.internal:3000 -r zap-report.html'
                }
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: '.',
                    reportFiles: 'zap-report.html',
                    reportName: 'DAST Report'
                ])
            }
        }

        stage('Deploy') {
            steps {
                script {
                    bat 'docker stop sample-node-app || true'
                    bat 'docker rm sample-node-app || true'
                    bat 'docker build -t sample-node-app .'
                    bat 'docker run -d -p 3000:3000 --name sample-node-app sample-node-app'
                }
            }
        }
    }
}
