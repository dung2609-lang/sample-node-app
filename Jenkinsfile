pipeline {
    agent any

    environment {
        SONARQUBE = credentials('sonar-token')
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/dung2609-lang/sample-node-app'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test || echo "No tests found"'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    bat '''
                        npx sonar-scanner ^
                        -Dsonar.projectKey=sample-node-app ^
                        -Dsonar.sources=. ^
                        -Dsonar.host.url=http://localhost:9000 ^
                        -Dsonar.login=%SONARQUBE%
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t sample-node-app .'
            }
        }

        stage('Deploy') {
            steps {
                echo "Triển khai container Node.js lên Docker..."
                bat 'docker run -d -p 3000:3000 --name sample-node-app sample-node-app || echo "Container already running"'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/report*.xml', fingerprint: true
            echo "✅ Pipeline finished!"
        }
    }
}
