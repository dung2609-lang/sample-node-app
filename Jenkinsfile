pipeline {
    agent any

    environment {
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_TOKEN = credentials('sonar-token')
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

        stage('Build Application') {
            steps {
                echo "Build step..."
                bat 'npm run build || echo "No build script"'
            }
        }

        stage('Prepare Reports Folder') {
            steps {
                echo "Creating reports folder..."
                bat 'mkdir reports'
                bat 'echo Pipeline OK > reports/result.txt'
            }
        }
    }

    post {
        always {
            script {
                echo "Archiving artifacts..."
                archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
            }
        }
        failure {
            echo "Build failed - check reports."
        }
        success {
            echo "Build completed successfully!"
        }
    }
}
