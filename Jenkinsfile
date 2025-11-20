pipeline {
    agent any

    environment {
        SONAR_HOST_URL = "http://localhost:9000"
        DOCKER_IMAGE = "sample-node-app"
        REPORT_DIR = "reports"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Cloning repository..."
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing Node.js packages..."
                bat "npm install"
            }
        }

        stage('SAST - SonarQube') {
            steps {
                echo "Running SonarQube Scan..."
                withSonarQubeEnv('sonarqube') {
                    bat """
                        sonar-scanner ^
                        -Dsonar.projectKey=sample-node ^
                        -Dsonar.sources=. ^
                        -Dsonar.host.url=%SONAR_HOST_URL% ^
                        -Dsonar.login=%SONARQUBE_AUTH_TOKEN%
                    """
                }
            }
        }

        stage('SCA - OWASP Dependency Check') {
            steps {
                echo "Running Dependency Check..."
                bat """
                    dependency-check.bat --project sample-node ^
                    --scan . ^
                    --out reports/dependency-check-report.html
                """
            }
        }

        stage('Build Application') {
            steps {
                echo "Building Docker image..."
                bat "docker build -t sample-node-app ."
            }
        }

        stage('Deploy (Local Docker)') {
            steps {
                bat "docker rm -f sample-node-app || exit 0"
                bat "docker run -d -p 3000:3000 --name sample-node-app sample-node-app"
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                echo "Running ZAP Scan..."
                bat """
                    docker run --rm -v %cd%/reports:/zap/wrk owasp/zap-weekly \
                    zap-baseline.py -t http://host.docker.internal:3000 \
                    -r zap-report.html
                """
            }
        }

        stage('Prepare Reports Folder') {
            steps {
                echo "Archiving reports..."
                archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
            }
        }
    }

    post {
        failure {
            echo "Build failed - check reports."
        }
        success {
            echo "Pipeline completed successfully!"
        }
    }
}
