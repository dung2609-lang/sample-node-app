pipeline {
    agent any

    tools {
        nodejs "node18"
    }

    environment {
        DOCKER_IMAGE = "sample-node-app"
        DOCKER_CONTAINER = "sample-node-container"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/dung2609-lang/sample-node-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    bat "docker build -t %DOCKER_IMAGE% ."
                }
            }
        }

        stage('Run Container') {
            steps {
                script {
                    bat "docker stop %DOCKER_CONTAINER% || exit 0"
                    bat "docker rm %DOCKER_CONTAINER% || exit 0"
                    bat "docker run -d -p 3000:3000 --name %DOCKER_CONTAINER% %DOCKER_IMAGE%"
                }
            }
        }
    }
}
