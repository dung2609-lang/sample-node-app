pipeline {
    agent any

    environment {
        SONAR_URL = 'http://localhost:9000'
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/<username>/sample-node-app.git', credentialsId: 'github-token'
            }
        }

        stage('Build App') {
            steps {
                bat 'docker build -t sample-node-app .'
            }
        }

        stage('Run SAST - SonarQube') {
            steps {
                bat 'sonar-scanner -Dsonar.projectKey=sample-node-app -Dsonar.sources=. -Dsonar.host.url=%SONAR_URL% -Dsonar.login=%SONAR_TOKEN%'
            }
        }

        stage('Run SCA - OWASP Dependency Check') {
            steps {
                bat 'dependency-check.bat --project "sample-node-app" --scan . --format "HTML" --out reports'
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker run -d -p 8080:8080 sample-node-app'
            }
        }

        stage('Run DAST - OWASP ZAP') {
            steps {
                bat 'zap-cli --api-key <API_KEY> quick-scan --self-contained --start-options "-config api.key=<API_KEY>" http://localhost:8080'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
    }
}
