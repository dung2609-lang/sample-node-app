pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/dung2609-lang/sample-node-app.git', credentialsId: 'github-token'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t sample-node-app .'
            }
        }

        stage('Run Container') {
            steps {
                bat 'docker stop sample-node-app || echo "container not running"'
                bat 'docker rm sample-node-app || echo "container not exist"'
                bat 'docker run -d -p 3000:3000 --name sample-node-app sample-node-app'
            }
        }
    }
}
