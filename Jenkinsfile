pipeline {
    agent any

    environment {
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_TOKEN = credentials('sonar-token')
        DEP_REPORT = "reports/dependency-check-report.html"
        ZAP_REPORT = "reports/zap-report.html"
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
                bat 'npm install'
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
                        -Dsonar.login=%SONAR_TOKEN%
                    """
                }
            }
        }

        stage('SCA - OWASP Dependency Check') {
            steps {
                echo "Running Dependency-Check..."
                bat """
                    dependency-check.bat ^
                      --project "sample-node" ^
                      --scan "." ^
                      --format "HTML" ^
                      --out "reports"
                """
            }
        }

        stage('Build Application') {
            steps {
                echo "Building application..."
                bat 'npm run build || echo "No build script"'
            }
        }

        stage('Deploy (Local Docker)') {
            steps {
                echo "Deploying with Docker..."
                bat """
                    docker build -t sample-node-app .
                    docker stop sample-node-app || echo Not running
                    docker rm sample-node-app || echo Not exists
                    docker run -d -p 3000:3000 --name sample-node-app sample-node-app
                """
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                echo "Running ZAP Baseline Scan..."
                bat """
                    docker run --rm -v %cd%/reports:/zap/wrk/ owasp/zap2docker-stable zap-baseline.py ^
                      -t http://localhost:3000 ^
                      -r zap-report.html
                """
            }
        }

        stage('Prepare Reports Folder') {
            steps {
                echo "Ensuring reports folder exists..."
                bat 'mkdir reports || echo exists'
                bat 'echo Pipeline completed > reports/result.txt'
            }
        }
    }

    post {
        always {
            echo "Archiving artifacts..."
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
        failure {
            echo "Build failed - check reports."
        }
        success {
            echo "Build completed successfully!"
        }
    }
}
