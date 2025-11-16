pipeline {
    agent any

    tools {
        nodejs "node18"
    }

    environment {
        APP_NAME = "sample-node-app"
        DOCKER_IMAGE = "sample-node-app-image"
    }

    stages {

        stage('Checkout Source') {
            steps {
                git credentialsId: 'github-token',
                    url: 'https://github.com/dung2609-lang/sample-node-app.git',
                    branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %DOCKER_IMAGE% ."
            }
        }

        stage('Docker Run (Deploy)') {
            steps {
                // Stop old container if exists
                bat 'docker stop sample-node-app || true'
                bat 'docker rm sample-node-app || true'

                // Run new container
                bat "docker run -d --name sample-node-app -p 3000:3000 %DOCKER_IMAGE%"
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
        }
    }
}
